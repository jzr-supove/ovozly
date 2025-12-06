import torch
import torchaudio
from loguru import logger
from typing import Any
from io import BytesIO
from pydub import AudioSegment

from core.config import settings


def split_audio(audio: Any, max_length: int = 5) -> list:
    sample_rate = 16000  # Target sample rate
    max_samples = max_length * sample_rate  # Convert seconds to samples
    return [audio[:, i : i + max_samples] for i in range(0, audio.size(1), max_samples)]


def convert_mp3_to_wav(mp3_file: Any) -> BytesIO:
    logger.debug(f"Trying to open {mp3_file}...")
    audio = AudioSegment.from_file(mp3_file, format=mp3_file.split(".")[-1])
    wav_bytes_io = BytesIO()
    audio.export(wav_bytes_io, format="wav")
    wav_bytes_io.seek(0)
    logger.debug(f"Successfully opened and converted {mp3_file}!")
    return wav_bytes_io


def process_audio_chunk(chunk, *args) -> list:
    """
    Process a single chunk of audio to text (local model only).
    """
    from ai.loader import device, get_model, get_processor

    audio_inputs = get_processor()(audios=chunk, return_tensors="pt", sampling_rate=16_000)
    audio_inputs = {key: tensor.to(device) for key, tensor in audio_inputs.items()}

    with torch.amp.autocast("cuda"):
        output_tokens = get_model().generate(**audio_inputs, tgt_lang="uzn")

    # Move tensors back to CPU and clear GPU memory
    torch.cuda.empty_cache()

    return output_tokens


def audio_to_text(audio_file, max_length=10):
    """
    Convert audio to text, processing in chunks if necessary (local model only).
    """
    from ai.loader import get_processor

    # Load and resample the audio
    audio, orig_freq = torchaudio.load(audio_file)
    audio = torchaudio.functional.resample(audio, orig_freq=orig_freq, new_freq=16_000)

    # Split audio into smaller chunks if it's too long
    # audio_chunks = split_audio(audio, max_length=max_length)
    audio_chunks = [audio]

    text_results = []
    for chunk in audio_chunks:
        output_tokens = process_audio_chunk(chunk)

        # Debugging token structure
        logger.debug(f"Output Tokens: {output_tokens}")
        logger.debug(f"Output Tokens Type: {type(output_tokens)}")
        logger.debug(f"Output Tokens[0]: {output_tokens[0]}")
        logger.debug(f"Output Tokens[0] Type: {type(output_tokens[0])}")

        # Flatten token IDs if needed
        if isinstance(output_tokens[0], torch.Tensor):
            token_ids = output_tokens[0].tolist()  # Convert tensor to list

        elif isinstance(output_tokens[0], list):
            token_ids = output_tokens[0]  # Already a list

        else:
            raise TypeError(f"Unexpected type for output tokens: {type(output_tokens[0])}")

        # Decode tokens to text
        text_results.append(get_processor().decode(token_ids, skip_special_tokens=True))

    # Combine results from all chunks
    return " ".join(text_results)


def audio_to_text_v2(audio_file: BytesIO) -> str:
    """
    Convert audio to text using the configured STT provider.

    Uses either local Seamless M4T model or OpenAI Whisper API
    based on the STT_PROVIDER setting.

    Args:
        audio_file: Audio data as BytesIO (WAV format)

    Returns:
        Transcribed text
    """
    if settings.STT_PROVIDER == "whisper":
        return _transcribe_with_whisper(audio_file)
    else:
        return _transcribe_with_local_model(audio_file)


def _transcribe_with_whisper(audio_file: BytesIO) -> str:
    """
    Transcribe audio using OpenAI Whisper API (fast, cloud-based).
    """
    from ai.whisper_api import transcribe_audio_whisper

    audio_file.seek(0)
    return transcribe_audio_whisper(audio_file)


def _transcribe_with_local_model(audio_file: BytesIO) -> str:
    """
    Transcribe audio using local Seamless M4T model (slow, GPU-based).
    """
    from ai.loader import device, get_model, get_processor

    audio, orig_freq = torchaudio.load(audio_file, format="wav", backend="soundfile")

    audio = torchaudio.functional.resample(audio, orig_freq=orig_freq, new_freq=16_000)

    # generates silence to audios less than 1 sec
    min_num_samples = 1000
    if audio.shape[1] < min_num_samples:
        padded = torch.zeros((1, min_num_samples), dtype=audio.dtype)
        padded[0, : audio.shape[1]] = audio[0]
        audio = padded
        logger.debug(f"Audio shape after padding: {audio.shape}")

    audio_inputs = get_processor()(audios=audio, return_tensors="pt", sampling_rate=16_000)

    # Ensure GPU
    audio_inputs = {key: tensor.to(device) for key, tensor in audio_inputs.items()}

    with torch.amp.autocast("cuda"):
        output_tokens = get_model().generate(**audio_inputs, tgt_lang="uzn")

    if isinstance(output_tokens[0], torch.Tensor):
        token_ids = output_tokens[0].tolist()

    elif isinstance(output_tokens[0], list):
        token_ids = output_tokens[0]

    else:
        raise TypeError(f"Unexpected type for output tokens: {type(output_tokens[0])}")

    return get_processor().decode(token_ids, skip_special_tokens=True)


def split_audio_into_segments(
    audio: BytesIO, audio_ext: str, diar_data: dict, do_merge: bool = True
) -> list:
    merged = []
    prev_speaker = ""

    for i in diar_data:
        if do_merge:
            if prev_speaker == i["speaker"]:
                merged[-1]["end"] = i["end"]
            else:
                merged.append(i)
                prev_speaker = i["speaker"]
        else:
            merged.append(i)

    logger.debug(f"Merged conversation segments: {len(merged)}")
    logger.debug(f"Segments:\n{merged}")

    # Load the audio file
    audio.seek(0)  # Make sure stream position is at the start
    audio = AudioSegment.from_file(audio, format=audio_ext)
    segments = []

    # Loop through timestamps and export each segment
    timestamps = [(i["start"], i["end"]) for i in merged]
    for i, (start, end) in enumerate(timestamps):
        start_ms = start * 1000
        end_ms = end * 1000

        # Extract the audio segment
        segment = audio[start_ms:end_ms]

        # Save to BytesIO
        output = BytesIO()
        segment.export(output, format="wav")
        output.seek(0)

        # Append to segments
        segments.append(output)

    return segments


def merge_diarization_and_text(diarization_data: list, text_data: list) -> list:
    merged = []
    for diar, txt in zip(diarization_data, text_data):
        diar_copy = diar.copy()
        diar_copy["text"] = txt
        merged.append(diar_copy)
    return merged


def get_audio_duration(audio: BytesIO, audio_format: str) -> float:
    audio.seek(0)
    audio = AudioSegment.from_file(audio, format=audio_format)
    return audio.duration_seconds
