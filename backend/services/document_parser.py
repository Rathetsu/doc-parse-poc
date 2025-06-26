import logging
from typing import Dict, Any, Literal
from pathlib import Path
import os
import json

try:
    from docling.document_converter import DocumentConverter
    from docling_core.transforms.serializer.html import HTMLDocSerializer
    from docling_core.transforms.serializer.markdown import MarkdownDocSerializer
except ImportError as e:
    raise ImportError(
        "Docling is not installed. Please install it with: "
        "pip install docling docling-core"
    ) from e

logger = logging.getLogger(__name__)

# Define supported output formats
OutputFormat = Literal["markdown", "json", "text", "html"]


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
        """Initialize the Docling converter with default settings."""
        try:
            # Initialize with default configuration
            self.converter = DocumentConverter()
            logger.info("Document converter initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize document converter: {e}")
            raise DocumentParsingError(f"Failed to initialize parser: {e}")

    def parse_document(
        self, file_path: str, output_format: OutputFormat = "markdown"
    ) -> Dict[str, Any]:
        """
        Parse a document and return structured content in specified format.

        Args:
            file_path: Path to the document file
            output_format: Desired output format (markdown, json, text,
                          html)

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

            # Generate content based on the requested format
            parsed_content = self._export_document_content(document, output_format)

            # Extract metadata
            metadata = {
                'title': (getattr(document, 'title', None) or Path(file_path).stem),
                'page_count': (
                    len(document.pages) if hasattr(document, 'pages') else None
                ),
                'file_size': os.path.getsize(file_path),
                'file_type': Path(file_path).suffix.lower(),
                'tables_count': self._count_tables(document),
                'images_count': self._count_images(document),
                'output_format': output_format,
            }

            return {
                'success': True,
                'content': parsed_content,
                'metadata': metadata,
                'raw_document': document,  # Keep for potential future use
            }

        except Exception as e:
            logger.error(f"Document parsing failed for {file_path}: {e}")
            raise DocumentParsingError(f"Failed to parse document: {e}")

    def _export_document_content(self, document, output_format: OutputFormat) -> str:
        """
        Export document content in the specified format.

        Args:
            document: The parsed Docling document
            output_format: Desired output format

        Returns:
            String representation of the document in the specified format
        """
        try:
            if output_format == "markdown":
                # Use MarkdownDocSerializer for better control
                serializer = MarkdownDocSerializer(doc=document)
                return serializer.serialize().text

            elif output_format == "json":
                # Export to dictionary and convert to JSON
                doc_dict = document.export_to_dict()
                return json.dumps(doc_dict, indent=2, ensure_ascii=False)

            elif output_format == "text":
                # Extract plain text by getting markdown and stripping
                markdown_content = document.export_to_markdown()
                # Simple text extraction - you could make this more sophisticated
                import re

                text_content = re.sub(r'[#*`_\[\]()]', '', markdown_content)
                text_content = re.sub(r'\n+', '\n', text_content)
                return text_content.strip()

            elif output_format == "html":
                # Use HTMLDocSerializer
                serializer = HTMLDocSerializer(doc=document)
                return serializer.serialize().text

            else:
                raise DocumentParsingError(
                    f"Unsupported output format: {output_format}"
                )

        except Exception as e:
            logger.error(f"Failed to export document in {output_format} format: {e}")
            raise DocumentParsingError(
                f"Failed to export document in {output_format} format: {e}"
            )

    def get_supported_formats(self) -> list[OutputFormat]:
        """
        Get list of supported output formats.

        Returns:
            List of supported output format strings
        """
        return ["markdown", "json", "text", "html"]

    def _count_tables(self, document) -> int:
        """Count tables in the document."""
        try:
            count = 0
            if hasattr(document, 'pages'):
                for page in document.pages:
                    if hasattr(page, 'tables'):
                        count += len(page.tables)
            return count
        except Exception:
            return 0

    def _count_images(self, document) -> int:
        """Count images in the document."""
        try:
            count = 0
            if hasattr(document, 'pages'):
                for page in document.pages:
                    if hasattr(page, 'images'):
                        count += len(page.images)
            return count
        except Exception:
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
