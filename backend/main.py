"""
Ovozly Backend - FastAPI Application Entry Point

This module initializes and configures the FastAPI application for the Ovozly
call center analytics platform. It sets up CORS middleware and registers all
API route handlers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.endpoints import stt, users


app = FastAPI(
    title="Ovozly API",
    description="Call center analytics and speech processing platform powered by AI",
    version="1.0.0",
)


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins temporarily
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(stt.router)
app.include_router(users.router)
