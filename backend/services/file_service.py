import os
import uuid
import logging
from typing import Optional, Tuple
from pathlib import Path
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from config.settings import Config

logger = logging.getLogger(__name__)


class FileServiceError(Exception):
    """Custom exception for file service errors."""

    pass


class FileService:
    """Service for handling file uploads and management."""

    def __init__(self):
        """Initialize the file service."""
        self.upload_folder = Config.UPLOAD_FOLDER
        self.allowed_extensions = Config.ALLOWED_EXTENSIONS
        self.max_file_size = Config.MAX_CONTENT_LENGTH

        # Ensure upload directory exists
        os.makedirs(self.upload_folder, exist_ok=True)

    def is_allowed_file(self, filename: str) -> bool:
        """
        Check if file extension is allowed.

        Args:
            filename: Name of the file

        Returns:
            True if extension is allowed, False otherwise
        """
        if not filename or '.' not in filename:
            return False

        extension = filename.rsplit('.', 1)[1].lower()
        return extension in self.allowed_extensions

    def validate_file(self, file: FileStorage) -> Tuple[bool, str]:
        """
        Validate uploaded file.

        Args:
            file: Uploaded file object

        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            # Check if file exists
            if not file or not file.filename:
                return False, "No file provided"

            # Check file extension
            if not self.is_allowed_file(file.filename):
                allowed_exts = ', '.join(self.allowed_extensions)
                return False, f"File type not allowed. Supported types: {allowed_exts}"

            # Check file size (Flask handles this automatically with MAX_CONTENT_LENGTH,
            # but we can add additional validation here)
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # Reset position

            if file_size > self.max_file_size:
                size_mb = self.max_file_size / (1024 * 1024)
                return False, f"File too large. Maximum size: {size_mb:.1f}MB"

            if file_size == 0:
                return False, "File is empty"

            return True, ""

        except Exception as e:
            logger.error(f"File validation error: {e}")
            return False, f"File validation failed: {e}"

    def save_file(self, file: FileStorage) -> Tuple[bool, str, Optional[str]]:
        """
        Save uploaded file to disk.

        Args:
            file: Uploaded file object

        Returns:
            Tuple of (success, message, file_path)
        """
        try:
            # Validate file first
            is_valid, error_msg = self.validate_file(file)
            if not is_valid:
                return False, error_msg, None

            # Generate unique filename
            original_filename = secure_filename(file.filename)
            file_extension = Path(original_filename).suffix
            unique_filename = f"{uuid.uuid4()}{file_extension}"

            # Create full file path
            file_path = os.path.join(self.upload_folder, unique_filename)

            # Save file
            file.save(file_path)

            # Verify file was saved correctly
            if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                return False, "Failed to save file", None

            logger.info(f"File saved successfully: {unique_filename}")
            return True, "File uploaded successfully", file_path

        except Exception as e:
            logger.error(f"File save error: {e}")
            return False, f"Failed to save file: {e}", None

    def delete_file(self, file_path: str) -> bool:
        """
        Delete a file from disk.

        Args:
            file_path: Path to the file to delete

        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"File deleted: {file_path}")
                return True
            else:
                logger.warning(f"File not found for deletion: {file_path}")
                return False

        except Exception as e:
            logger.error(f"File deletion error: {e}")
            return False

    def cleanup_old_files(self, max_age_hours: int = 24) -> int:
        """
        Clean up old uploaded files.

        Args:
            max_age_hours: Maximum age of files to keep in hours

        Returns:
            Number of files deleted
        """
        try:
            import time

            current_time = time.time()
            max_age_seconds = max_age_hours * 3600
            deleted_count = 0

            for filename in os.listdir(self.upload_folder):
                file_path = os.path.join(self.upload_folder, filename)

                if os.path.isfile(file_path):
                    file_age = current_time - os.path.getmtime(file_path)

                    if file_age > max_age_seconds:
                        if self.delete_file(file_path):
                            deleted_count += 1

            logger.info(f"Cleanup completed: {deleted_count} files deleted")
            return deleted_count

        except Exception as e:
            logger.error(f"Cleanup error: {e}")
            return 0

    def get_file_info(self, file_path: str) -> Optional[dict]:
        """
        Get information about a file.

        Args:
            file_path: Path to the file

        Returns:
            Dictionary with file information or None if file doesn't exist
        """
        try:
            if not os.path.exists(file_path):
                return None

            stat = os.stat(file_path)

            return {
                'size': stat.st_size,
                'modified': stat.st_mtime,
                'extension': Path(file_path).suffix.lower(),
                'filename': Path(file_path).name,
            }

        except Exception as e:
            logger.error(f"Error getting file info: {e}")
            return None
