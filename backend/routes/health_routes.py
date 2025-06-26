from flask import Blueprint, jsonify
import logging
from config.settings import Config

logger = logging.getLogger(__name__)

health_bp = Blueprint('health', __name__)


@health_bp.route('/health', methods=['GET'])
def health_check():
    """Basic health check endpoint."""
    return (
        jsonify({'status': 'healthy', 'message': 'Document Parser API is running'}),
        200,
    )


@health_bp.route('/config', methods=['GET'])
def config_check():
    """Check configuration status."""
    try:
        config_status = {
            'openai_configured': bool(Config.OPENAI_API_KEY),
            'upload_folder_exists': bool(Config.UPLOAD_FOLDER),
            'model': Config.OPENAI_MODEL,
            'max_file_size_mb': Config.MAX_CONTENT_LENGTH / (1024 * 1024),
            'supported_formats': list(Config.ALLOWED_EXTENSIONS),
        }

        all_configured = config_status['openai_configured']

        return jsonify(
            {
                'status': 'configured' if all_configured else 'partially_configured',
                'config': config_status,
            }
        ), (200 if all_configured else 206)

    except Exception as e:
        logger.error(f"Config check error: {e}")
        return (
            jsonify({'status': 'error', 'error': 'Failed to check configuration'}),
            500,
        )
