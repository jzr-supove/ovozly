"""
Ovozly Backend - OpenAI Whisper API Integration

Provides fast cloud-based speech-to-text transcription using OpenAI's Whisper API.
Supports Uzbek and Russian languages with word-level timestamps for diarization mapping.
"""

from io import BytesIO
from typing import Optional, List, Dict, Any

from openai import OpenAI
from pydub import AudioSegment
from loguru import logger

from core.config import settings


class WhisperSTT:
    """
    OpenAI Whisper API client for speech-to-text transcription.

    Significantly faster than local model inference as processing
    happens on OpenAI's cloud infrastructure.
    """

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "whisper-1"

    def _convert_to_wav(self, audio_file: BytesIO, audio_ext: str) -> BytesIO:
        """
        Convert any audio format to WAV for reliable Whisper API compatibility.
        """
        audio_file.seek(0)
        audio = AudioSegment.from_file(audio_file, format=audio_ext)

        wav_buffer = BytesIO()
        audio.export(wav_buffer, format="wav")
        wav_buffer.seek(0)

        return wav_buffer

    def transcribe_with_timestamps(
        self,
        audio_file: BytesIO,
        audio_ext: str = "wav",
        language: Optional[str] = None,
        prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Transcribe full audio with word-level timestamps.

        Args:
            audio_file: Audio data as BytesIO
            audio_ext: File extension (wav, mp3, ogg, etc.)
            language: ISO-639-1 language code, or None for auto-detection.
                     Note: Whisper doesn't support Uzbek - use None with prompt instead.
            prompt: Optional prompt to guide transcription (helps with Uzbek)

        Returns:
            Dict with 'text' (full transcript) and 'segments' (with timestamps)
        """
        # Convert to WAV for reliable compatibility with Whisper API
        if audio_ext.lower() != "wav":
            logger.debug(f"Converting {audio_ext} to WAV for Whisper API")
            wav_audio = self._convert_to_wav(audio_file, audio_ext)
        else:
            audio_file.seek(0)
            wav_audio = audio_file

        # Create file-like object with name attribute for OpenAI SDK
        wav_audio.name = "audio.wav"

        kwargs = {
            "model": self.model,
            "file": wav_audio,
            "response_format": "verbose_json",
            "timestamp_granularities": ["segment", "word"],
        }

        # Only add language if specified (None = auto-detect)
        if language:
            kwargs["language"] = language

        if prompt:
            kwargs["prompt"] = prompt

        logger.debug(f"Sending audio to Whisper API (original format={audio_ext}, language={language or 'auto-detect'})")

        try:
            response = self.client.audio.transcriptions.create(**kwargs)
            logger.debug(f"Whisper transcription complete: {len(response.text)} chars")

            return {
                "text": response.text,
                "segments": response.segments if hasattr(response, 'segments') else [],
                "words": response.words if hasattr(response, 'words') else [],
                "language": response.language if hasattr(response, 'language') else language,
            }
        except Exception as e:
            logger.error(f"Whisper API error: {e}")
            raise

    def transcribe_simple(
        self,
        audio_file: BytesIO,
        language: str = "uz",
    ) -> str:
        """
        Simple transcription without timestamps (for small segments).
        """
        audio_file.seek(0)
        audio_file.name = "audio.wav"

        try:
            response = self.client.audio.transcriptions.create(
                model=self.model,
                file=audio_file,
                response_format="text",
                language=language,
            )
            return response
        except Exception as e:
            logger.error(f"Whisper API error: {e}")
            raise


# Singleton instance
whisper_stt = WhisperSTT()


def transcribe_full_audio(
    audio_file: BytesIO,
    audio_ext: str = "wav",
    language: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Transcribe full audio file with timestamps.

    Args:
        audio_file: Full audio as BytesIO
        audio_ext: File extension (wav, mp3, ogg, m4a, etc.)
        language: Optional language code. Note: Whisper doesn't support Uzbek ('uz').
                 For Uzbek audio, leave as None and use prompt to guide transcription.
                 Supported: 'ru' (Russian), 'en' (English), etc.

    Returns:
        Dict with transcript and timestamp data
    """
    # Prompt with common Uzbek/Russian call center phrases to guide transcription
    # This helps Whisper understand the context even without explicit language setting
    prompt = (
        "Assalomu alaykum. Salom. Sizga qanday yordam bera olaman? "
        "Rahmat. Xayr. Здравствуйте. Спасибо. "
        "Kredit, ariza, telefon, xizmat, operator."
    )

    return whisper_stt.transcribe_with_timestamps(
        audio_file=audio_file,
        audio_ext=audio_ext,
        language=language,  # None = auto-detect
        prompt=prompt,
    )


def map_transcript_to_diarization(
    whisper_result: Dict[str, Any],
    diarization_data: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Map Whisper transcript segments to PyAnnote diarization speakers.

    Takes the timestamped transcript from Whisper and assigns speaker labels
    based on which diarization segment each word/segment falls into.

    Args:
        whisper_result: Output from transcribe_full_audio()
        diarization_data: PyAnnote diarization output with speaker segments

    Returns:
        List of segments with speaker labels and text
    """
    if not diarization_data:
        # No diarization, return transcript as single segment
        return [{
            "speaker": "SPEAKER_00",
            "start": 0,
            "end": 0,
            "text": whisper_result.get("text", ""),
        }]

    # Use word-level timestamps if available, otherwise use segments
    whisper_segments = whisper_result.get("words") or whisper_result.get("segments") or []

    if not whisper_segments:
        # Fallback: distribute text across diarization segments
        logger.warning("No timestamp data from Whisper, using fallback distribution")
        return _fallback_distribution(whisper_result.get("text", ""), diarization_data)

    # Build result by assigning text to diarization segments
    result = []

    for diar_segment in diarization_data:
        diar_start = diar_segment["start"]
        diar_end = diar_segment["end"]
        speaker = diar_segment["speaker"]

        # Collect words/segments that fall within this diarization window
        segment_text_parts = []

        for ws in whisper_segments:
            # Handle both dict and Pydantic object (TranscriptionWord/TranscriptionSegment)
            if hasattr(ws, "start"):
                ws_start = ws.start
                ws_end = getattr(ws, "end", ws_start)
                word_text = getattr(ws, "word", None) or getattr(ws, "text", "")
            else:
                ws_start = ws.get("start", 0)
                ws_end = ws.get("end", ws_start)
                word_text = ws.get("word") or ws.get("text", "")

            # Check if this word/segment overlaps with diarization segment
            # Using midpoint for better accuracy
            ws_mid = (ws_start + ws_end) / 2

            if diar_start <= ws_mid <= diar_end:
                if word_text:
                    segment_text_parts.append(word_text.strip())

        # Combine text for this speaker segment
        segment_text = " ".join(segment_text_parts)

        result.append({
            "speaker": speaker,
            "start": diar_start,
            "end": diar_end,
            "text": segment_text,
        })

    # Merge consecutive segments from same speaker
    merged = _merge_consecutive_speakers(result)

    return merged


def _fallback_distribution(full_text: str, diarization_data: List[Dict]) -> List[Dict]:
    """
    Fallback: Distribute text proportionally across diarization segments.
    Used when Whisper doesn't return timestamp data.
    """
    if not full_text or not diarization_data:
        return diarization_data

    # Calculate total duration
    total_duration = sum(d["end"] - d["start"] for d in diarization_data)
    if total_duration == 0:
        return diarization_data

    words = full_text.split()
    total_words = len(words)

    result = []
    word_index = 0

    for diar in diarization_data:
        segment_duration = diar["end"] - diar["start"]
        segment_proportion = segment_duration / total_duration
        words_for_segment = max(1, int(total_words * segment_proportion))

        segment_words = words[word_index:word_index + words_for_segment]
        word_index += words_for_segment

        result.append({
            "speaker": diar["speaker"],
            "start": diar["start"],
            "end": diar["end"],
            "text": " ".join(segment_words),
        })

    # Add any remaining words to last segment
    if word_index < total_words and result:
        result[-1]["text"] += " " + " ".join(words[word_index:])

    return result


def _merge_consecutive_speakers(segments: List[Dict]) -> List[Dict]:
    """
    Merge consecutive segments from the same speaker.
    """
    if not segments:
        return segments

    merged = []
    current = segments[0].copy()

    for segment in segments[1:]:
        if segment["speaker"] == current["speaker"]:
            # Same speaker - merge
            current["end"] = segment["end"]
            if segment["text"]:
                current["text"] = (current["text"] + " " + segment["text"]).strip()
        else:
            # Different speaker - save current and start new
            merged.append(current)
            current = segment.copy()

    merged.append(current)
    return merged


# Legacy function for backward compatibility
def transcribe_audio_whisper(audio_file: BytesIO, language: Optional[str] = None) -> str:
    """
    Legacy function - transcribes a single audio segment.
    For new code, use transcribe_full_audio() instead.
    """
    return whisper_stt.transcribe_simple(
        audio_file=audio_file,
        language=language or "uz",
    )
