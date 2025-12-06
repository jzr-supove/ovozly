"""
Ovozly Backend - AISHA STT Integration with Diarization Mapping

Provides high-quality Uzbek speech-to-text using AISHA API.
Segments audio by diarization timestamps and transcribes each segment,
directly mapping transcriptions to speakers.
"""

from io import BytesIO
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from pydub import AudioSegment
from loguru import logger

from core.config import settings


API_URL = "https://back.aisha.group/api/v1/stt/post/"


def transcribe_segment(audio_segment: AudioSegment, segment_index: int, language: str = "uz") -> str:
    """
    Transcribe a single audio segment using AISHA API.

    Args:
        audio_segment: pydub AudioSegment to transcribe
        segment_index: Index for logging/debugging
        language: Language code (uz, ru, etc.)

    Returns:
        Transcribed text string
    """
    # Export segment to WAV in memory
    wav_buffer = BytesIO()
    audio_segment.export(wav_buffer, format="wav")
    wav_buffer.seek(0)

    headers = {"x-api-key": settings.AISHA_API_KEY}
    files = {"audio": (f"segment_{segment_index}.wav", wav_buffer, "audio/wav")}
    data = {"title": f"segment_{segment_index}", "has_diarization": "false", "language": language}

    try:
        response = requests.post(API_URL, headers=headers, files=files, data=data, timeout=30)

        if response.status_code != 200:
            logger.warning(f"AISHA API error for segment {segment_index}: {response.status_code}")
            return ""

        result = response.json()
        text = result.get("text", "") or result.get("transcript", "") or ""
        logger.debug(f"Segment {segment_index} transcribed: {len(text)} chars")
        return text.strip()

    except Exception as e:
        logger.error(f"AISHA API error for segment {segment_index}: {e}")
        return ""


def transcribe_with_diarization(
    audio_file: BytesIO,
    audio_ext: str,
    diarization_segments: List[Dict[str, Any]],
    language: str = "uz",
    merge_speakers: bool = True,
    max_workers: int = 4,
) -> List[Dict[str, Any]]:
    """
    Transcribe audio using AISHA API, mapping to diarization speakers.

    Splits audio by diarization timestamps, transcribes each segment,
    and returns results with speaker labels.

    Args:
        audio_file: Full audio as BytesIO
        audio_ext: Audio file extension (m4a, mp3, wav, etc.)
        diarization_segments: PyAnnote diarization output with speaker/start/end
        language: Language code for AISHA (uz, ru, etc.)
        merge_speakers: Whether to merge consecutive segments from same speaker
        max_workers: Number of parallel transcription requests

    Returns:
        List of dicts with speaker, start, end, and text
    """
    if not diarization_segments:
        logger.warning("No diarization segments provided")
        return []

    # Load full audio
    audio_file.seek(0)
    full_audio = AudioSegment.from_file(audio_file, format=audio_ext)
    logger.debug(f"Loaded audio: {len(full_audio)}ms, {audio_ext} format")

    # Optionally merge consecutive segments from same speaker before transcribing
    # This reduces API calls and gives better context for transcription
    if merge_speakers:
        segments_to_process = _merge_consecutive_speakers(diarization_segments)
        logger.debug(f"Merged {len(diarization_segments)} segments into {len(segments_to_process)}")
    else:
        segments_to_process = diarization_segments

    # Extract audio segments
    audio_segments = []
    for i, seg in enumerate(segments_to_process):
        start_ms = int(seg["start"] * 1000)
        end_ms = int(seg["end"] * 1000)
        audio_chunk = full_audio[start_ms:end_ms]
        audio_segments.append((i, seg, audio_chunk))

    # Transcribe segments in parallel
    results = [None] * len(audio_segments)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_idx = {
            executor.submit(transcribe_segment, chunk, idx, language): idx
            for idx, seg, chunk in audio_segments
        }

        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            try:
                text = future.result()
                results[idx] = text
            except Exception as e:
                logger.error(f"Transcription failed for segment {idx}: {e}")
                results[idx] = ""

    # Build final result with speaker labels
    final_result = []
    for i, (idx, seg, chunk) in enumerate(audio_segments):
        final_result.append({
            "speaker": seg["speaker"],
            "start": seg["start"],
            "end": seg["end"],
            "text": results[i] or "",
        })

    logger.debug(f"Transcription complete: {len(final_result)} segments")
    return final_result


def _merge_consecutive_speakers(segments: List[Dict]) -> List[Dict]:
    """
    Merge consecutive segments from the same speaker.
    This reduces the number of API calls and provides better context.
    """
    if not segments:
        return segments

    merged = []
    current = segments[0].copy()

    for segment in segments[1:]:
        if segment["speaker"] == current["speaker"]:
            # Same speaker - extend the segment
            current["end"] = segment["end"]
        else:
            # Different speaker - save current and start new
            merged.append(current)
            current = segment.copy()

    merged.append(current)
    return merged
