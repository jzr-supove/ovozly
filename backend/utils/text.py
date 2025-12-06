import os


def split_text_into_chunks(text: str, chunk_length: int = 2000, threshold: int = 4000) -> list:
    if len(text) <= threshold:
        return [text]

    chunks = [text[i : i + chunk_length] for i in range(0, len(text), chunk_length)]
    return chunks


def get_extension(filename: str):
    """
    Extracts the extension name from a filename.

    Args:
        filename (str): The filename to extract the extension from.

    Returns:
        str: The extension of the file, or an empty string if no extension is present.
    """
    return os.path.splitext(filename)[1][1:]
