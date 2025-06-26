from flask import Flask
from flask_cors import CORS
from config.settings import Config
from routes.document_routes import document_bp
from routes.health_routes import health_bp
import os


def create_app():
    """Application factory pattern for creating Flask app."""
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Enable CORS for frontend communication
    CORS(app, origins=["http://localhost:3000"])

    # Register blueprints
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(document_bp, url_prefix='/api')

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5001)
