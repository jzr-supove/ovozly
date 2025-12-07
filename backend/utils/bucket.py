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


def upload_bytesio_and_make_public(
    bytes_data: BytesIO, dest_name: str, content_type: str = "audio/mpeg"
) -> str:
    """
    Upload a BytesIO object to GCS and return a signed URL.

    Uses signed URLs because the bucket has uniform bucket-level access enabled,
    which doesn't allow per-object ACLs.

    Args:
        bytes_data: In-memory file data
        dest_name: Destination blob name in GCS
        content_type: MIME type for the file (default: audio/mpeg)

    Returns:
        Signed URL valid for 30 days
    """
    bucket = client.bucket(settings.BUCKET_NAME)
    blob = bucket.blob(dest_name)

    # Upload from BytesIO with content type
    blob.upload_from_file(bytes_data, rewind=True, content_type=content_type)
    # rewind=True ensures the stream is at the start

    # Generate signed URL with 30 day expiration
    # Using signed URLs because bucket has uniform bucket-level access enabled
    signed_url = blob.generate_signed_url(expiration=timedelta(days=30))
    logger.debug(f"File uploaded with signed URL valid for 30 days: {signed_url}")

    return signed_url


def delete_blob_from_url(file_url: str) -> bool:
    """
    Delete a blob from GCS using its signed URL or public URL.

    Args:
        file_url: The URL of the file (signed or public)

    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        # Extract blob name from URL
        # URL format: https://storage.googleapis.com/bucket-name/blob-name?signature...
        # or: https://storage.cloud.google.com/bucket-name/blob-name?signature...
        bucket = client.bucket(settings.BUCKET_NAME)

        # Parse the URL to get the blob name
        if settings.BUCKET_NAME in file_url:
            # Extract everything after the bucket name
            parts = file_url.split(settings.BUCKET_NAME + "/")
            if len(parts) > 1:
                # Remove query parameters (signed URL params)
                blob_name = parts[1].split("?")[0]
                blob = bucket.blob(blob_name)
                blob.delete()
                logger.info(f"Deleted blob: {blob_name}")
                return True

        logger.warning(f"Could not extract blob name from URL: {file_url}")
        return False

    except Exception as e:
        logger.error(f"Error deleting blob: {e}")
        raise


# Example usage
if __name__ == "__main__":
    url = upload_and_make_public("test.txt", "destination-file.txt")
    print(url)
