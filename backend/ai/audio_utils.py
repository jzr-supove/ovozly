"""
Ovozly Backend - Audio Utilities

Provides audio file manipulation utilities using pydub.
"""

from io import BytesIO
from typing import List, Dict

from loguru import logger
from pydub import AudioSegment


def convert_mp3_to_wav(mp3_file: str) -> BytesIO:
    """Convert an audio file to WAV format."""
    logger.debug(f"Trying to open {mp3_file}...")
    audio = AudioSegment.from_file(mp3_file, format=mp3_file.split(".")[-1])
    wav_bytes_io = BytesIO()
    audio.export(wav_bytes_io, format="wav")
    wav_bytes_io.seek(0)
    logger.debug(f"Successfully opened and converted {mp3_file}!")
    return wav_bytes_io


def split_audio_into_segments(
    audio: BytesIO, audio_ext: str, diar_data: List[Dict], do_merge: bool = True
) -> List[BytesIO]:
    """
    Split audio into segments based on diarization data.

    Args:
        audio: Audio file as BytesIO
        audio_ext: Audio file extension (m4a, mp3, wav, etc.)
        diar_data: Diarization data with speaker, start, end
        do_merge: Whether to merge consecutive segments from same speaker

    Returns:
        List of audio segments as BytesIO
    """
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
    audio.seek(0)
    audio_segment = AudioSegment.from_file(audio, format=audio_ext)
    segments = []

    # Loop through timestamps and export each segment
    timestamps = [(i["start"], i["end"]) for i in merged]
    for i, (start, end) in enumerate(timestamps):
        start_ms = start * 1000
        end_ms = end * 1000

        # Extract the audio segment
        segment = audio_segment[start_ms:end_ms]

        # Save to BytesIO
        output = BytesIO()
        segment.export(output, format="wav")
        output.seek(0)

        # Append to segments
        segments.append(output)

    return segments


def merge_diarization_and_text(diarization_data: List[Dict], text_data: List[str]) -> List[Dict]:
    """Merge diarization segments with transcribed text."""
    merged = []
    for diar, txt in zip(diarization_data, text_data):
        diar_copy = diar.copy()
        diar_copy["text"] = txt
        merged.append(diar_copy)
    return merged


def get_audio_duration(audio: BytesIO, audio_format: str) -> float:
    """Get the duration of an audio file in seconds."""
    audio.seek(0)
    audio_segment = AudioSegment.from_file(audio, format=audio_format)
    return audio_segment.duration_seconds
