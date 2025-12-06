import requests

from core.config import settings


API_URL = "https://back.aisha.group/api/v1/stt/post/"
API_KEY = settings.AISHA_API_KEY


def stt(audio: any, title: str, has_diarization: True, language: str = "uz"):
    headers = {"x-api-key": API_KEY}
    files = {"audio": audio}
    data = {"title": title, "has_diarization": "false", "language": language}
    # Force has_diarization to False, since API is shit

    response = requests.post(API_URL, headers=headers, files=files, data=data)

    print(response.status_code)
    print(response.json())

    if response.status_code != 200:
        return {}

    return response.json()


if __name__ == "__main__":
    audio = open("../tests/call-center-tbc.mp3", mode="rb")
    print(audio)
    res = stt(audio, audio.name, has_diarization=True, language="uz")
    print(res)
