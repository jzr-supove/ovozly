#!/usr/bin/env python3
"""
Set CORS configuration for GCS bucket.

This script configures CORS on the bucket to allow frontend access to audio files.

Usage:
    python scripts/set_bucket_cors.py

Requirements:
    - GOOGLE_APPLICATION_CREDENTIALS environment variable set
    - google-cloud-storage package installed
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from google.cloud import storage

# Load environment variables
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path, override=True)

# Import settings after loading env
from core.config import settings


def set_bucket_cors():
    """Set CORS configuration on the GCS bucket."""

    # CORS configuration
    cors_configuration = [
        {
            "origin": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                # Add your production domain here
                # "https://yourdomain.com",
            ],
            "method": ["GET", "HEAD", "OPTIONS"],
            "responseHeader": [
                "Content-Type",
                "Content-Length",
                "Content-Range",
                "Accept-Ranges",
                "Range",
            ],
            "maxAgeSeconds": 3600,
        }
    ]

    # Initialize client and get bucket
    client = storage.Client()
    bucket = client.bucket(settings.BUCKET_NAME)

    # Set CORS
    bucket.cors = cors_configuration
    bucket.patch()

    print(f"CORS configuration set for bucket: {settings.BUCKET_NAME}")
    print(f"Allowed origins: {cors_configuration[0]['origin']}")
    print(f"Allowed methods: {cors_configuration[0]['method']}")
    print(f"Allowed headers: {cors_configuration[0]['responseHeader']}")


def get_bucket_cors():
    """Get current CORS configuration from the bucket."""
    client = storage.Client()
    bucket = client.get_bucket(settings.BUCKET_NAME)  # Use get_bucket to fetch from API

    print(f"Current CORS configuration for bucket: {settings.BUCKET_NAME}")
    if bucket.cors:
        for i, rule in enumerate(bucket.cors):
            print(f"\nRule {i + 1}:")
            print(f"  Origins: {rule.get('origin', [])}")
            print(f"  Methods: {rule.get('method', [])}")
            print(f"  Headers: {rule.get('responseHeader', [])}")
            print(f"  Max Age: {rule.get('maxAgeSeconds', 'N/A')} seconds")
    else:
        print("No CORS configuration set.")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Manage GCS bucket CORS configuration")
    parser.add_argument("--get", action="store_true", help="Get current CORS configuration")
    parser.add_argument("--set", action="store_true", help="Set CORS configuration")

    args = parser.parse_args()

    if args.get:
        get_bucket_cors()
    elif args.set:
        set_bucket_cors()
    else:
        # Default: show current and set new
        print("=== Current Configuration ===")
        get_bucket_cors()
        print("\n=== Setting New Configuration ===")
        set_bucket_cors()
        print("\n=== Verification ===")
        get_bucket_cors()
