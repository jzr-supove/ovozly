"""
Ovozly Backend - Google Cloud Storage Utilities

Provides functions for uploading files to GCS and generating signed URLs
for temporary public access.
"""

from datetime import timedelta
from io import BytesIO

from google.cloud import storage
from loguru import logger

from core.config import settings


# Initialize GCS client (uses GOOGLE_APPLICATION_CREDENTIALS env var)
client = storage.Client()


def upload_and_make_public(source_file_name: str, dest_name: str) -> str:
    """
    Upload a file from disk to GCS and return a signed URL.

    Args:
        source_file_name: Path to the local file
        dest_name: Destination blob name in GCS

    Returns:
        Signed URL valid for 5 days
    """
    # Initialize bucket
    bucket = client.bucket(settings.BUCKET_NAME)
    blob = bucket.blob(dest_name)

    # Upload file
    blob.upload_from_filename(source_file_name)

    # Option 1: Make the file public
    # blob.make_public()
    # logger.debug(f"File uploaded and publicly accessible at {blob.public_url}")

    # Option 2: manually build public url
    # public_url = f"https://storage.googleapis.com/{bucket.name}/{blob.name}"
    # logger.debug(f"File uploaded and publicly accessible at {public_url}")

    # Option 3: Make file public temporarily with signed url
    signed_url = blob.generate_signed_url(expiration=timedelta(days=5))
    logger.debug(f"File uploaded and publicly accessible for 5 days at {signed_url}")

    return signed_url


def upload_bytesio_and_make_public(bytes_data: BytesIO, dest_name: str) -> str:
    """
    Upload a BytesIO object to GCS and return a signed URL.

    Args:
        bytes_data: In-memory file data
        dest_name: Destination blob name in GCS

    Returns:
        Signed URL valid for 5 days
    """
    bucket = client.bucket(settings.BUCKET_NAME)
    blob = bucket.blob(dest_name)

    # Upload from BytesIO
    blob.upload_from_file(bytes_data, rewind=True)
    # rewind=True ensures the stream is at the start

    signed_url = blob.generate_signed_url(expiration=timedelta(days=5))
    logger.debug(f"File uploaded and publicly accessible for 5 days at {signed_url}")

    return signed_url


# Example usage
if __name__ == "__main__":
    url = upload_and_make_public("test.txt", "destination-file.txt")
    print(url)
