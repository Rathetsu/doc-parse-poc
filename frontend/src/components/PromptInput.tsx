import React from "react";
import "./PromptInput.css";

interface PromptInputProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	placeholder?: string;
	onAnalyze?: () => void;
	canAnalyze?: boolean;
	isAnalyzing?: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({
	value,
	onChange,
	disabled = false,
	placeholder = "Enter your prompt here...",
	onAnalyze,
	canAnalyze = false,
	isAnalyzing = false,
}) => {
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
					{onAnalyze && (
						<button
							onClick={onAnalyze}
							disabled={!canAnalyze}
							className="analyze-button"
						>
							{isAnalyzing ? "Analyzing..." : "🔍 Analyze"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default PromptInput;
