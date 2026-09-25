import os
import io
import tempfile
import logging
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


class TranscriptionService:
    @staticmethod
    def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
        """
        Transcribes multilingual audio (Indic languages & English) using Groq Whisper-large-v3-turbo.
        """
        if not settings.GROQ_API_KEY:
            logger.warning("GROQ_API_KEY missing for audio transcription.")
            return "Audio transcription service currently in offline simulation mode."

        try:
            from groq import Groq
            client = Groq(api_key=settings.GROQ_API_KEY)

            # Write bytes to temporary file for Whisper submission
            suffix = os.path.splitext(filename)[1] or ".webm"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
                tmp_file.write(audio_bytes)
                tmp_file_path = tmp_file.name

            try:
                with open(tmp_file_path, "rb") as file_handle:
                    transcription = client.audio.transcriptions.create(
                        file=(filename, file_handle.read()),
                        model="whisper-large-v3-turbo",
                        response_format="json",
                        temperature=0.0,
                    )
                text = getattr(transcription, "text", "") or ""
                logger.info(f"Successfully transcribed audio: {len(text)} chars")
                return text.strip()
            finally:
                if os.path.exists(tmp_file_path):
                    os.remove(tmp_file_path)

        except Exception as e:
            logger.error(f"Audio transcription error: {e}")
            return "Could not transcribe audio due to temporary service issue. Please try typing your legal question."
