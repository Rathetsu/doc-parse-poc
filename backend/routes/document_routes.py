from flask import Blueprint, request, jsonify
import logging
import os
from services.file_service import FileService, FileServiceError
from services.document_parser import DocumentParser, DocumentParsingError
from services.openai_service import OpenAIService, OpenAIServiceError

logger = logging.getLogger(__name__)

document_bp = Blueprint('document', __name__)

# Initialize services
file_service = FileService()
document_parser = DocumentParser()
openai_service = OpenAIService()


@document_bp.route('/analyze', methods=['POST'])
def analyze_document():
    """
    Analyze a document with AI based on user prompt.

    Expected form data:
    - file: Document file
    - prompt: User's analysis prompt
    - output_format: Optional output format for parsing (default: markdown)
    """
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400

        if 'prompt' not in request.form:
            return jsonify({'success': False, 'error': 'No prompt provided'}), 400

        file = request.files['file']
        user_prompt = request.form['prompt'].strip()
        output_format = request.form.get('output_format', 'markdown')

        if not user_prompt:
            return jsonify({'success': False, 'error': 'Prompt cannot be empty'}), 400

        # Validate output format
        supported_formats = document_parser.get_supported_formats()
        if output_format not in supported_formats:
            return (
                jsonify(
                    {
                        'success': False,
                        'error': f'Unsupported output format: {output_format}. Supported formats: {supported_formats}',
                    }
                ),
                400,
            )

        # Save uploaded file
        success, message, file_path = file_service.save_file(file)
        if not success:
            return jsonify({'success': False, 'error': message}), 400

        try:
            # Parse document with specified format
            logger.info(f"Parsing document: {file_path} in {output_format} format")
            parse_result = document_parser.parse_document(file_path, output_format)

            if not parse_result['success']:
                return (
                    jsonify({'success': False, 'error': 'Failed to parse document'}),
                    500,
                )

            document_content = parse_result['content']
            document_metadata = parse_result['metadata']

            # For LLM analysis, always use markdown format for better processing
            if output_format != 'markdown':
                # Get markdown version for LLM processing
                markdown_result = document_parser.parse_document(file_path, 'markdown')
                llm_content = markdown_result['content']
            else:
                llm_content = document_content

            # Check content length
            if not openai_service.check_content_length(llm_content, user_prompt):
                return (
                    jsonify(
                        {
                            'success': False,
                            'error': 'Document is too large for analysis. Please try with a smaller document.',
                        }
                    ),
                    400,
                )

            # Analyze with OpenAI
            logger.info("Analyzing document with OpenAI")
            analysis_result = openai_service.analyze_document(
                document_content=llm_content,
                user_prompt=user_prompt,
                document_metadata=document_metadata,
            )

            if not analysis_result['success']:
                return (
                    jsonify({'success': False, 'error': 'Failed to analyze document'}),
                    500,
                )

            # Prepare response with both parsed content and analysis
            response_data = {
                'success': True,
                'analysis': analysis_result['response'],
                'parsed_content': document_content,
                'metadata': {
                    'document': document_metadata,
                    'usage': analysis_result['usage'],
                    'model': analysis_result['usage']['model_used'],
                },
            }

            logger.info("Document analysis completed successfully")
            return jsonify(response_data), 200

        finally:
            # Clean up uploaded file
            if file_path and os.path.exists(file_path):
                file_service.delete_file(file_path)
                logger.info(f"Cleaned up file: {file_path}")

    except FileServiceError as e:
        logger.error(f"File service error: {e}")
        return jsonify({'success': False, 'error': f'File handling error: {e}'}), 400

    except DocumentParsingError as e:
        logger.error(f"Document parsing error: {e}")
        return (
            jsonify({'success': False, 'error': f'Document parsing failed: {e}'}),
            500,
        )

    except OpenAIServiceError as e:
        logger.error(f"OpenAI service error: {e}")
        return jsonify({'success': False, 'error': f'AI analysis failed: {e}'}), 500

    except Exception as e:
        logger.error(f"Unexpected error in document analysis: {e}")
        return (
            jsonify(
                {
                    'success': False,
                    'error': 'An unexpected error occurred. Please try again.',
                }
            ),
            500,
        )


@document_bp.route('/parse', methods=['POST'])
def parse_document_only():
    """
    Parse a document without AI analysis.

    Expected form data:
    - file: Document file
    - output_format: Optional output format (default: markdown)
    """
    try:
        # Validate request
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400

        file = request.files['file']
        output_format = request.form.get('output_format', 'markdown')

        # Validate output format
        supported_formats = document_parser.get_supported_formats()
        if output_format not in supported_formats:
            return (
                jsonify(
                    {
                        'success': False,
                        'error': f'Unsupported output format: {output_format}. Supported formats: {supported_formats}',
                    }
                ),
                400,
            )

        # Save uploaded file
        success, message, file_path = file_service.save_file(file)
        if not success:
            return jsonify({'success': False, 'error': message}), 400

        try:
            # Parse document
            logger.info(f"Parsing document: {file_path} in {output_format} format")
            parse_result = document_parser.parse_document(file_path, output_format)

            if not parse_result['success']:
                return (
                    jsonify({'success': False, 'error': 'Failed to parse document'}),
                    500,
                )

            # Prepare response
            response_data = {
                'success': True,
                'content': parse_result['content'],
                'metadata': parse_result['metadata'],
            }

            logger.info("Document parsing completed successfully")
            return jsonify(response_data), 200

        finally:
            # Clean up uploaded file
            if file_path and os.path.exists(file_path):
                file_service.delete_file(file_path)
                logger.info(f"Cleaned up file: {file_path}")

    except FileServiceError as e:
        logger.error(f"File service error: {e}")
        return jsonify({'success': False, 'error': f'File handling error: {e}'}), 400

    except DocumentParsingError as e:
        logger.error(f"Document parsing error: {e}")
        return (
            jsonify({'success': False, 'error': f'Document parsing failed: {e}'}),
            500,
        )

    except Exception as e:
        logger.error(f"Unexpected error in document parsing: {e}")
        return (
            jsonify(
                {
                    'success': False,
                    'error': 'An unexpected error occurred. Please try again.',
                }
            ),
            500,
        )


@document_bp.route('/supported-formats', methods=['GET'])
def get_supported_formats():
    """Get list of supported file formats."""
    try:
        formats = list(file_service.allowed_extensions)
        return (
            jsonify(
                {
                    'success': True,
                    'formats': formats,
                    'max_file_size_mb': file_service.max_file_size / (1024 * 1024),
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error getting supported formats: {e}")
        return (
            jsonify({'success': False, 'error': 'Failed to get supported formats'}),
            500,
        )


@document_bp.route('/output-formats', methods=['GET'])
def get_output_formats():
    """Get list of supported output formats for parsing."""
    try:
        output_formats = document_parser.get_supported_formats()
        return (
            jsonify(
                {
                    'success': True,
                    'output_formats': output_formats,
                }
            ),
            200,
        )

    except Exception as e:
        logger.error(f"Error getting output formats: {e}")
        return (
            jsonify({'success': False, 'error': 'Failed to get output formats'}),
            500,
        )


@document_bp.route('/validate-file', methods=['POST'])
def validate_file():
    """Validate a file without processing it."""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400

        file = request.files['file']
        is_valid, error_message = file_service.validate_file(file)

        if is_valid:
            return jsonify({'success': True, 'message': 'File is valid'}), 200
        else:
            return jsonify({'success': False, 'error': error_message}), 400

    except Exception as e:
        logger.error(f"Error validating file: {e}")
        return jsonify({'success': False, 'error': 'File validation failed'}), 500
