import React, { useState } from "react";
import { AnalysisResult } from "../types/api";
import { formatFileSize } from "../utils/fileUtils";
import "./AnalysisResponse.css";

interface AnalysisResponseProps {
	result: AnalysisResult;
}

const AnalysisResponse: React.FC<AnalysisResponseProps> = ({ result }) => {
	const [showMetadata, setShowMetadata] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(result.analysis);
			// You could add a toast notification here
			alert("Analysis copied to clipboard!");
		} catch (err) {
			console.error("Failed to copy to clipboard:", err);
		}
	};

	const formatResponse = (text: string) => {
		// Simple formatting for better readability
		return text.split("\n").map((line, index) => {
			// Handle bullet points
			if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
				return (
					<li key={index} className="bullet-point">
						{line.trim().substring(2)}
					</li>
				);
			}

			// Handle numbered lists
			if (/^\d+\.\s/.test(line.trim())) {
				return (
					<li key={index} className="numbered-point">
						{line
							.trim()
							.substring(line.indexOf(".") + 1)
							.trim()}
					</li>
				);
			}

			// Handle headers (lines that end with :)
			if (line.trim().endsWith(":") && line.trim().length > 1) {
				return (
					<h4 key={index} className="response-header">
						{line.trim()}
					</h4>
				);
			}

			// Regular paragraphs
			if (line.trim()) {
				return (
					<p key={index} className="response-paragraph">
						{line.trim()}
					</p>
				);
			}

			return <br key={index} />;
		});
	};

	return (
		<div className="analysis-response">
			<div className="response-header-section">
				<h2>🤖 AI Analysis</h2>
				<div className="response-actions">
					<button onClick={copyToClipboard} className="copy-button">
						📋 Copy
					</button>
					<button
						onClick={() => setShowMetadata(!showMetadata)}
						className="metadata-toggle"
					>
						📊 {showMetadata ? "Hide" : "Show"} Details
					</button>
				</div>
			</div>

			<div className="response-content">
				<div className="analysis-text">{formatResponse(result.analysis)}</div>
			</div>

			{showMetadata && (
				<div className="metadata-section">
					<h3>📋 Document Information</h3>
					<div className="metadata-grid">
						<div className="metadata-item">
							<span className="label">File Name:</span>
							<span className="value">{result.metadata.document.title}</span>
						</div>
						<div className="metadata-item">
							<span className="label">File Type:</span>
							<span className="value">
								{result.metadata.document.file_type}
							</span>
						</div>
						<div className="metadata-item">
							<span className="label">File Size:</span>
							<span className="value">
								{formatFileSize(result.metadata.document.file_size)}
							</span>
						</div>
						{result.metadata.document.page_count && (
							<div className="metadata-item">
								<span className="label">Pages:</span>
								<span className="value">
									{result.metadata.document.page_count}
								</span>
							</div>
						)}
						{result.metadata.document.tables_count > 0 && (
							<div className="metadata-item">
								<span className="label">Tables:</span>
								<span className="value">
									{result.metadata.document.tables_count}
								</span>
							</div>
						)}
						{result.metadata.document.images_count > 0 && (
							<div className="metadata-item">
								<span className="label">Images:</span>
								<span className="value">
									{result.metadata.document.images_count}
								</span>
							</div>
						)}
					</div>

					<h3>🔧 Processing Information</h3>
					<div className="metadata-grid">
						<div className="metadata-item">
							<span className="label">AI Model:</span>
							<span className="value">{result.metadata.model}</span>
						</div>
						<div className="metadata-item">
							<span className="label">Tokens Used:</span>
							<span className="value">
								{result.metadata.usage.total_tokens.toLocaleString()}
							</span>
						</div>
						<div className="metadata-item">
							<span className="label">Prompt Tokens:</span>
							<span className="value">
								{result.metadata.usage.prompt_tokens.toLocaleString()}
							</span>
						</div>
						<div className="metadata-item">
							<span className="label">Completion Tokens:</span>
							<span className="value">
								{result.metadata.usage.completion_tokens.toLocaleString()}
							</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AnalysisResponse;
