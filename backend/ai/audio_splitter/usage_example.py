import os
from ai.audio_utils import audio_to_text_v2, convert_mp3_to_wav


def main():
    fragments = [f"./{fn}" for fn in os.listdir("./") if fn.endswith("mp3")]
    fragments = sorted(fragments, key=lambda x: int(x.split("_")[-1][:-4]))

    speaker = 0

    print("Converting audio to text...")
    for fragment in fragments:
        fragment = convert_mp3_to_wav(fragment)
        # audio = AudioSegment.from_file(fragment)
        text_result = audio_to_text_v2(fragment)
        print(f"So‘zlovchi-{speaker}:", text_result)
        speaker = 0 if speaker else 1
