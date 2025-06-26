import React, { useState } from "react";
import { AnalysisResult } from "../types/api";
import "./AnalysisResponse.css";

interface AnalysisResponseProps {
	result: AnalysisResult;
}

const AnalysisResponse: React.FC<AnalysisResponseProps> = ({ result }) => {
	const [copySuccess, setCopySuccess] = useState<boolean>(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(result.analysis);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const formatFileSize = (bytes: number): string => {
		const sizes = ["Bytes", "KB", "MB", "GB"];
		if (bytes === 0) return "0 Byte";
		const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
		return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
	};

	return (
		<div className="analysis-response">
			{/* LLM Analysis Section */}
			<div className="analysis-section">
				<div className="analysis-header">
					<h3 className="analysis-title">🤖 AI Analysis</h3>
					<button
						onClick={handleCopy}
						className="copy-analysis-button"
						title="Copy analysis to clipboard"
					>
						{copySuccess ? "✅ Copied!" : "📋 Copy"}
					</button>
				</div>
				<div className="analysis-content">
					<div className="analysis-text">
						{result.analysis.split("\n").map((paragraph, index) => (
							<p key={index}>{paragraph}</p>
						))}
					</div>
				</div>
			</div>

			{/* Metadata Section */}
			<div className="metadata-section">
				<div className="metadata-header">
					<h4>📊 Document & Processing Info</h4>
				</div>
				<div className="metadata-grid">
					<div className="metadata-group">
						<h5>Document Details</h5>
						<div className="metadata-items">
							<div className="metadata-item">
								<span className="metadata-label">Title:</span>
								<span className="metadata-value">
									{result.metadata.document.title}
								</span>
							</div>
							<div className="metadata-item">
								<span className="metadata-label">File Type:</span>
								<span className="metadata-value">
									{result.metadata.document.file_type.toUpperCase()}
								</span>
							</div>
							<div className="metadata-item">
								<span className="metadata-label">File Size:</span>
								<span className="metadata-value">
									{formatFileSize(result.metadata.document.file_size)}
								</span>
							</div>
							{result.metadata.document.page_count && (
								<div className="metadata-item">
									<span className="metadata-label">Pages:</span>
									<span className="metadata-value">
										{result.metadata.document.page_count}
									</span>
								</div>
							)}
							<div className="metadata-item">
								<span className="metadata-label">Tables:</span>
								<span className="metadata-value">
									{result.metadata.document.tables_count}
								</span>
							</div>
							<div className="metadata-item">
								<span className="metadata-label">Images:</span>
								<span className="metadata-value">
									{result.metadata.document.images_count}
								</span>
							</div>
							{result.metadata.document.output_format && (
								<div className="metadata-item">
									<span className="metadata-label">Parsing Format:</span>
									<span className="metadata-value parsing-format">
										{result.metadata.document.output_format.toUpperCase()}
									</span>
								</div>
							)}
						</div>
					</div>

					<div className="metadata-group">
						<h5>AI Processing Details</h5>
						<div className="metadata-items">
							<div className="metadata-item">
								<span className="metadata-label">Model:</span>
								<span className="metadata-value">
									{result.metadata.usage.model_used}
								</span>
							</div>
							<div className="metadata-item">
								<span className="metadata-label">Prompt Tokens:</span>
								<span className="metadata-value">
									{result.metadata.usage.prompt_tokens.toLocaleString()}
								</span>
							</div>
							<div className="metadata-item">
								<span className="metadata-label">Response Tokens:</span>
								<span className="metadata-value">
									{result.metadata.usage.completion_tokens.toLocaleString()}
								</span>
							</div>
							<div className="metadata-item">
								<span className="metadata-label">Total Tokens:</span>
								<span className="metadata-value">
									{result.metadata.usage.total_tokens.toLocaleString()}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AnalysisResponse;
