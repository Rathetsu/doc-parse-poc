import logging
from typing import Dict, Any, Optional
from pathlib import Path
import tempfile
import os

try:
    from docling.document_converter import DocumentConverter
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import PipelineOptions
except ImportError as e:
    raise ImportError(
        "Docling is not installed. Please install it with: pip install docling"
    ) from e

logger = logging.getLogger(__name__)


class DocumentParsingError(Exception):
    """Custom exception for document parsing errors."""

    pass


class DocumentParser:
    """Service for parsing documents using Docling."""

    def __init__(self, timeout: int = 300):
        """
        Initialize the document parser.

        Args:
            timeout: Maximum time in seconds to wait for parsing
        """
        self.timeout = timeout
        self.converter = None
        self._initialize_converter()

    def _initialize_converter(self) -> None:
        """Initialize the Docling converter with optimal settings."""
        try:
            # Configure pipeline options for better performance
            pipeline_options = PipelineOptions()
            pipeline_options.do_ocr = True  # Enable OCR for images and scanned PDFs
            pipeline_options.do_table_structure = True  # Extract table structures

            self.converter = DocumentConverter(pipeline_options=pipeline_options)
            logger.info("Document converter initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize document converter: {e}")
            raise DocumentParsingError(f"Failed to initialize parser: {e}")

    def parse_document(self, file_path: str) -> Dict[str, Any]:
        """
        Parse a document and return structured content.

        Args:
            file_path: Path to the document file

        Returns:
            Dictionary containing parsed content and metadata

        Raises:
            DocumentParsingError: If parsing fails
        """
        try:
            if not os.path.exists(file_path):
                raise DocumentParsingError(f"File not found: {file_path}")

            # Convert document
            result = self.converter.convert(file_path)

            if not result or not result.document:
                raise DocumentParsingError("No content extracted from document")

            # Extract structured content
            document = result.document

            # Get text content
            text_content = document.export_to_markdown()

            # Extract metadata
            metadata = {
                'title': getattr(document, 'title', None) or Path(file_path).stem,
                'page_count': (
                    len(document.pages) if hasattr(document, 'pages') else None
                ),
                'file_size': os.path.getsize(file_path),
                'file_type': Path(file_path).suffix.lower(),
                'tables_count': self._count_tables(document),
                'images_count': self._count_images(document),
            }

            return {
                'success': True,
                'content': text_content,
                'metadata': metadata,
                'raw_document': document,  # Keep for potential future use
            }

        except Exception as e:
            logger.error(f"Document parsing failed for {file_path}: {e}")
            raise DocumentParsingError(f"Failed to parse document: {e}")

    def _count_tables(self, document) -> int:
        """Count tables in the document."""
        try:
            count = 0
            for page in document.pages:
                if hasattr(page, 'tables'):
                    count += len(page.tables)
            return count
        except:
            return 0

    def _count_images(self, document) -> int:
        """Count images in the document."""
        try:
            count = 0
            for page in document.pages:
                if hasattr(page, 'images'):
                    count += len(page.images)
            return count
        except:
            return 0

    def is_supported_format(self, file_path: str) -> bool:
        """
        Check if the file format is supported by Docling.

        Args:
            file_path: Path to the file

        Returns:
            True if supported, False otherwise
        """
        supported_extensions = {
            '.pdf',
            '.docx',
            '.pptx',
            '.png',
            '.jpg',
            '.jpeg',
            '.gif',
            '.tiff',
        }
        file_extension = Path(file_path).suffix.lower()
        return file_extension in supported_extensions
