"""
Ovozly Backend - OpenAI Integration

Provides conversation analysis using OpenAI GPT models with structured JSON output.
Extracts intents, sentiment, entities, issues, and recommendations from transcripts.
"""

import json
from typing import Any, Dict, Union

from openai import OpenAI

from core.config import settings


def analyze_conversation(input_data: list, model: str = "gpt-4o-mini") -> Union[Dict[str, Any], str]:
    """
    Analyze a conversation transcript using OpenAI GPT.

    Processes diarized transcript data and extracts structured insights including:
    - Language detection
    - Intent detection with confidence scores
    - Sentiment analysis (customer and agent)
    - Named entity extraction
    - Issue identification
    - Key points summary
    - Action recommendations

    Args:
        input_data: Diarized transcript as list of speaker segments
        model: OpenAI model to use (default: gpt-4o-mini)

    Returns:
        Structured analysis as dict, or raw response on JSON parse failure
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    system_content = """
    Generate a text analysis in Uzbek using the provided diarization JSON text.

    # Steps

    1. **Understand the JSON Structure:** Examine the provided JSON to understand the structure and contents. Identify key elements like speaker segments, timestamps, and transcriptions.
    2. **Extract Information:** Pull out relevant data.
    3. **Analyze Text:** Perform a detailed analysis of the extracted text, focusing on linguistic, thematic, or contextual aspects as required.
    4. **Craft the Analysis in Uzbek:** Translate your findings and observations into a coherent analysis in the Uzbek language, ensuring clarity and relevance.

    - Provide a structured paragraph in Uzbek that summarizes your text analysis.
    - Ensure the language is clear and maintains the integrity of the extracted information.

    - Ensure that the analysis focuses on the unique aspects of the text, such as speaker interaction, themes, or linguistic features.
    - Maintain the nuances of the Uzbek language in your analysis.
    - If the JSON structure varies, adjust the extraction process accordingly.
    """

    input_text = json.dumps(input_data, ensure_ascii=False, indent=4)

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": system_content,
            },
            {"role": "user", "content": input_text},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "conversation_analysis",
                "strict": True,
                "schema": {
                    "type": "object",
                    "properties": {
                        "call_metadata": {
                            "type": "object",
                            "properties": {
                                "language": {
                                    "type": "string",
                                    "enum": ["russian", "uzbek", "english"],
                                    "description": "Language used in the call",
                                }
                            },
                            "required": ["language"],
                            "additionalProperties": False,
                        },
                        "speech_analysis": {
                            "type": "object",
                            "properties": {
                                "transcript": {
                                    "type": "string",
                                    "description": "A structured text representation of the call, where each line is "
                                    "prefixed with the role of the speaker ('Agent' or 'Customer') followed "
                                    "by their dialogue. Consecutive dialogues from the same speaker are merged "
                                    "into a single entry to maintain readability and coherence, ensuring a clear "
                                    "distinction between speakers and a streamlined flow of conversation.",
                                },
                                "intent_detection": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "intent": {
                                                "type": "string",
                                                "description": "Detected intent of the conversation in uzbek",
                                            },
                                            "confidence_score": {
                                                "type": "number",
                                                "description": "Confidence score for the detected intent in uzbek",
                                            },
                                        },
                                        "required": ["intent", "confidence_score"],
                                        "additionalProperties": False,
                                    },
                                },
                                "sentiment_analysis": {
                                    "type": "object",
                                    "properties": {
                                        "customer_sentiment": {
                                            "type": "string",
                                            "enum": ["positive", "neutral", "negative"],
                                            "description": "Overall sentiment of the customer",
                                        },
                                        "agent_sentiment": {
                                            "type": "string",
                                            "enum": ["positive", "neutral", "negative"],
                                            "description": "Overall sentiment of the agent",
                                        },
                                    },
                                    "required": [
                                        "customer_sentiment",
                                        "agent_sentiment",
                                    ],
                                    "additionalProperties": False,
                                },
                                "entities_extracted": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "entity_type": {
                                                "type": "string",
                                                "description": "Type of the extracted entity in uzbek",
                                            },
                                            "value": {
                                                "type": "string",
                                                "description": "Value of the extracted entity in uzbek",
                                            },
                                            "confidence_score": {
                                                "type": "number",
                                                "description": "Confidence score for the extracted entity",
                                            },
                                        },
                                        "required": [
                                            "entity_type",
                                            "value",
                                            "confidence_score",
                                        ],
                                        "additionalProperties": False,
                                    },
                                },
                                "issues_identified": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "issue_type": {
                                                "type": "string",
                                                "description": "Type of issue identified during the call in uzbek",
                                            },
                                            "description": {
                                                "type": "string",
                                                "description": "Details of the identified issue in uzbek",
                                            },
                                        },
                                        "required": ["issue_type", "description"],
                                        "additionalProperties": False,
                                    },
                                },
                            },
                            "required": [
                                "transcript",
                                "intent_detection",
                                "sentiment_analysis",
                                "entities_extracted",
                                "issues_identified",
                            ],
                            "additionalProperties": False,
                        },
                        "summary_analysis": {
                            "type": "object",
                            "properties": {
                                "key_points": {
                                    "type": "array",
                                    "items": {
                                        "type": "string",
                                        "description": "Key points or insights from the call in uzbek",
                                    },
                                },
                                "overall_sentiment": {
                                    "type": "string",
                                    "enum": ["positive", "neutral", "negative"],
                                    "description": "Overall sentiment summary combining customer and agent sentiment",
                                },
                                "call_efficiency": {
                                    "type": "string",
                                    "enum": ["efficient", "average", "inefficient"],
                                    "description": "Evaluation of the call's efficiency based on duration, resolution, and tone",
                                },
                                "resolution_status": {
                                    "type": "string",
                                    "enum": ["resolved", "unresolved", "escalated"],
                                    "description": "Summary of whether the customer's issue was resolved during the call in uzbek",
                                },
                            },
                            "required": [
                                "key_points",
                                "overall_sentiment",
                                "call_efficiency",
                                "resolution_status",
                            ],
                            "additionalProperties": False,
                        },
                        "action_recommendations": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "action_type": {
                                        "type": "string",
                                        "description": "Type of action recommended in uzbek",
                                    },
                                    "details": {
                                        "type": "string",
                                        "description": "Details of the recommended action in uzbek",
                                    },
                                },
                                "required": ["action_type", "details"],
                                "additionalProperties": False,
                            },
                        },
                    },
                    "required": [
                        "call_metadata",
                        "speech_analysis",
                        "summary_analysis",
                        "action_recommendations",
                    ],
                    "additionalProperties": False,
                },
            },
        },
        temperature=1,
        max_completion_tokens=8192,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
    )

    response_content = response.choices[0].message.content
    try:
        json_format = json.loads(response_content)
        return json_format
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        print(f"Response Content: {response_content}")
        return response_content
