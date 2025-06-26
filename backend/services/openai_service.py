import logging
from typing import Dict, Any, Optional
from openai import OpenAI
from config.settings import Config

logger = logging.getLogger(__name__)


class OpenAIServiceError(Exception):
    """Custom exception for OpenAI service errors."""

    pass


class OpenAIService:
    """Service for interacting with OpenAI API."""

    def __init__(self):
        """Initialize the OpenAI service."""
        self.client = None
        self.model = Config.OPENAI_MODEL
        self._initialize_client()

    def _initialize_client(self) -> None:
        """Initialize the OpenAI client."""
        try:
            if not Config.OPENAI_API_KEY:
                raise OpenAIServiceError("OpenAI API key is not configured")

            # Initialize OpenAI client
            self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
            logger.info("OpenAI client initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            raise OpenAIServiceError(f"Failed to initialize OpenAI service: {e}")

    def analyze_document(
        self,
        document_content: str,
        user_prompt: str,
        document_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Analyze document content using OpenAI API.

        Args:
            document_content: Parsed document content
            user_prompt: User's analysis prompt
            document_metadata: Optional metadata about the document

        Returns:
            Dictionary containing AI response and metadata

        Raises:
            OpenAIServiceError: If analysis fails
        """
        try:
            # Prepare the system prompt
            system_prompt = self._create_system_prompt(document_metadata)

            # Prepare the user message
            user_message = self._create_user_message(document_content, user_prompt)

            # Make API call
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.1,  # Lower temperature for more consistent responses
                max_tokens=4000,  # Reasonable limit for responses
            )

            if not response.choices or not response.choices[0].message:
                raise OpenAIServiceError("No response received from OpenAI")

            ai_response = response.choices[0].message.content

            # Prepare response metadata
            usage_info = {
                'prompt_tokens': (
                    response.usage.prompt_tokens if response.usage else 0
                ),
                'completion_tokens': (
                    response.usage.completion_tokens if response.usage else 0
                ),
                'total_tokens': (response.usage.total_tokens if response.usage else 0),
                'model_used': self.model,
            }

            return {
                'success': True,
                'response': ai_response,
                'usage': usage_info,
                'finish_reason': response.choices[0].finish_reason,
            }

        except Exception as e:
            logger.error(f"Error in document analysis: {e}")
            raise OpenAIServiceError(f"Failed to analyze document: {e}")

    def _create_system_prompt(self, metadata: Optional[Dict[str, Any]] = None) -> str:
        """Create system prompt for document analysis."""
        base_prompt = """You are an expert document analyst. Your role is to provide accurate, insightful analysis of documents based on their content and the user's specific questions or requests.

Guidelines:
- Provide clear, concise, and well-structured responses
- Base your analysis strictly on the document content provided
- If the document doesn't contain information to answer a question, clearly state this
- Use bullet points or numbered lists when appropriate for clarity
- Cite specific sections or information from the document when possible"""

        if metadata:
            metadata_info = f"""

Document Information:
- File type: {metadata.get('file_type', 'Unknown')}
- Title: {metadata.get('title', 'Unknown')}
"""
            if metadata.get('page_count'):
                metadata_info += f"- Pages: {metadata['page_count']}\n"
            if metadata.get('tables_count'):
                metadata_info += f"- Tables: {metadata['tables_count']}\n"
            if metadata.get('images_count'):
                metadata_info += f"- Images: {metadata['images_count']}\n"

            base_prompt += metadata_info

        return base_prompt

    def _create_user_message(self, document_content: str, user_prompt: str) -> str:
        """Create user message combining document content and prompt."""
        return f"""User Request: {user_prompt}

Document Content:
{document_content}

Please analyze the document and respond to the user's request based on the content above."""

    def _estimate_tokens(self, text: str) -> int:
        """Rough estimate of token count for text."""
        # Simple estimation: ~4 characters per token
        return len(text) // 4

    def check_content_length(self, document_content: str, user_prompt: str) -> bool:
        """
        Check if content length is within reasonable limits.

        Args:
            document_content: Document content
            user_prompt: User prompt

        Returns:
            True if within limits, False otherwise
        """
        estimated_tokens = self._estimate_tokens(document_content + user_prompt)
        max_tokens = 12000 if self.model.startswith('gpt-4') else 3000
        return estimated_tokens < max_tokens
