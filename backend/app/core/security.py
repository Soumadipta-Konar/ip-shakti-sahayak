import re
import logging

logger = logging.getLogger(__name__)


class DPDPComplianceEngine:
    """
    Security Middleware to comply with India's Digital Personal Data Protection (DPDP) Act.
    Strips personally identifiable information (PII) before queries reach any LLM.
    """
    _analyzer = None
    _anonymizer = None
    _initialized = False

    @classmethod
    def _initialize(cls):
        if not cls._initialized:
            cls._initialized = True
            try:
                from presidio_analyzer import AnalyzerEngine
                from presidio_anonymizer import AnonymizerEngine
                cls._analyzer = AnalyzerEngine()
                cls._anonymizer = AnonymizerEngine()
                logger.info("Presidio PII anonymizer loaded successfully.")
            except Exception as e:
                logger.debug(f"Presidio not available ({e}), using robust regex PII compliance engine.")

    @classmethod
    def strip_pii(cls, text: str) -> str:
        cls._initialize()

        if cls._analyzer and cls._anonymizer:
            try:
                results = cls._analyzer.analyze(text=text, entities=["PHONE_NUMBER", "EMAIL_ADDRESS", "PERSON"], language="en")
                anonymized_result = cls._anonymizer.anonymize(text=text, analyzer_results=results)
                return anonymized_result.text
            except Exception as e:
                logger.debug(f"Presidio anonymization failed: {e}. Falling back to regex.")

        # Robust Regex DPDP compliance for Indian identifiers & PII
        # 1. 10-digit Indian mobile numbers (starting with 6-9)
        text = re.sub(r'\b[6-9]\d{9}\b', '[REDACTED_PHONE]', text)
        text = re.sub(r'\b(?:\+91|91)?[\s-]?[6-9]\d{4}[\s-]?\d{5}\b', '[REDACTED_PHONE]', text)

        # 2. Aadhaar numbers (12 digits with or without spaces/hyphens)
        text = re.sub(r'\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b', '[REDACTED_AADHAAR]', text)

        # 3. PAN card numbers (5 letters, 4 digits, 1 letter)
        text = re.sub(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', '[REDACTED_PAN]', text)

        # 4. Email addresses
        text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[REDACTED_EMAIL]', text)

        return text
