"""
Ovozly Backend - Google Cloud Storage Utilities

Provides functions for uploading files to GCS and generating public URLs.
Uses Uniform Bucket-Level Access with public bucket IAM for access control.
"""

from io import BytesIO
from urllib.parse import quote

from google.cloud import storage
from loguru import logger

from core.config import settings


# Initialize GCS client (uses GOOGLE_APPLICATION_CREDENTIALS env var)
client = storage.Client()


def get_public_url(bucket_name: str, blob_name: str) -> str:
    """
    Generate a public URL for a GCS object.

    With Uniform Bucket-Level Access enabled and public bucket IAM,
    this URL is publicly accessible without signing.

    Args:
        bucket_name: GCS bucket name
        blob_name: Object name in the bucket

    Returns:
        Public URL for the object
    """
    # URL-encode the blob name to handle special characters
    encoded_blob_name = quote(blob_name, safe="/")
    return f"https://storage.googleapis.com/{bucket_name}/{encoded_blob_name}"


def upload_and_make_public(source_file_name: str, dest_name: str) -> str:
    """
    Upload a file from disk to GCS and return a public URL.

    Args:
        source_file_name: Path to the local file
        dest_name: Destination blob name in GCS

    Returns:
        Public URL for the uploaded file
    """
    bucket = client.bucket(settings.BUCKET_NAME)
    blob = bucket.blob(dest_name)

    # Upload file
    blob.upload_from_filename(source_file_name)

    # Generate public URL (bucket has uniform bucket-level access with public IAM)
    public_url = get_public_url(settings.BUCKET_NAME, dest_name)
    logger.debug(f"File uploaded and publicly accessible at {public_url}")

    return public_url


def upload_bytesio_and_make_public(
    bytes_data: BytesIO, dest_name: str, content_type: str = "audio/mpeg"
) -> str:
    """
    Upload a BytesIO object to GCS and return a public URL.

    Uses Uniform Bucket-Level Access with public bucket IAM for access control.

    Args:
        bytes_data: In-memory file data
        dest_name: Destination blob name in GCS
        content_type: MIME type for the file (default: audio/mpeg)

    Returns:
        Public URL for the uploaded file
    """
    bucket = client.bucket(settings.BUCKET_NAME)
    blob = bucket.blob(dest_name)

    # Upload from BytesIO with content type
    blob.upload_from_file(bytes_data, rewind=True, content_type=content_type)
    # rewind=True ensures the stream is at the start

    # Generate public URL (bucket has uniform bucket-level access with public IAM)
    public_url = get_public_url(settings.BUCKET_NAME, dest_name)
    logger.debug(f"File uploaded and publicly accessible at {public_url}")

    return public_url


def delete_blob_from_url(file_url: str) -> bool:
    """
    Delete a blob from GCS using its public URL.

    Args:
        file_url: The public URL of the file

    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        # Extract blob name from URL
        # URL format: https://storage.googleapis.com/bucket-name/blob-name
        bucket = client.bucket(settings.BUCKET_NAME)

        # Parse the URL to get the blob name
        if settings.BUCKET_NAME in file_url:
            # Extract everything after the bucket name
            parts = file_url.split(settings.BUCKET_NAME + "/")
            if len(parts) > 1:
                # Remove query parameters if any
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
