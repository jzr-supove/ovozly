import os
import torch
from loguru import logger
from transformers import AutoProcessor, SeamlessM4Tv2ForSpeechToText

from core.config import settings


__all__ = ["get_processor", "get_model", "device"]

# cuda extra settings
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"

device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
logger.debug(f"Using device: {device}")

# Variables to hold the processor and model
_processor = None
_model = None


def get_processor():
    global _processor
    if _processor is None:
        _processor = AutoProcessor.from_pretrained(settings.MODEL_NAME)
    return _processor


def get_model():
    global _model
    if _model is None:
        _model = SeamlessM4Tv2ForSpeechToText.from_pretrained(settings.MODEL_NAME).to(device)
    return _model
