import React, { useState } from "react";
import "./PromptInput.css";

interface PromptInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
}

const SUGGESTED_PROMPTS = [
	"Summarize the key points and main conclusions",
	"What are the most important findings?",
	"Extract all numerical data and statistics",
	"What questions does this document answer?",
	"Identify the main themes and topics",
	"What action items or recommendations are mentioned?",
	"Explain this document in simple terms",
	"What are the potential risks or concerns mentioned?",
];

const PromptInput: React.FC<PromptInputProps> = ({
	value,
	onChange,
	disabled = false,
	placeholder = "Enter your prompt here...",
}) => {
	const [showSuggestions, setShowSuggestions] = useState(false);

	const handleSuggestionClick = (suggestion: string) => {
		onChange(suggestion);
		setShowSuggestions(false);
	};

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		onChange(e.target.value);
	};

	return (
		<div className="prompt-input">
			<div className="input-container">
				<textarea
					value={value}
					onChange={handleTextareaChange}
					disabled={disabled}
					placeholder={placeholder}
					className="prompt-textarea"
					rows={4}
					maxLength={1000}
				/>
				<div className="input-footer">
					<div className="character-count">{value.length}/1000 characters</div>
					<button
						type="button"
						onClick={() => setShowSuggestions(!showSuggestions)}
						disabled={disabled}
						className="suggestions-toggle"
					>
						💡 Suggestions
					</button>
				</div>
			</div>

			{showSuggestions && (
				<div className="suggestions-panel">
					<h4>💡 Suggested Prompts</h4>
					<div className="suggestions-list">
						{SUGGESTED_PROMPTS.map((suggestion, index) => (
							<button
								key={index}
								onClick={() => handleSuggestionClick(suggestion)}
								disabled={disabled}
								className="suggestion-item"
							>
								{suggestion}
							</button>
						))}
					</div>
					<button
						onClick={() => setShowSuggestions(false)}
						className="close-suggestions"
					>
						✕ Close
					</button>
				</div>
			)}
		</div>
	);
};

export default PromptInput;
