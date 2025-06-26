import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import FileUpload from "./FileUpload";
import PromptInput from "./PromptInput";
import AnalysisResponse from "./AnalysisResponse";
import LoadingSpinner from "./LoadingSpinner";
import { analyzeDocument } from "../services/api";
import { AnalysisResult, ApiError } from "../types/api";
import "./DocumentAnalyzer.css";

const DocumentAnalyzer: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [prompt, setPrompt] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [result, setResult] = useState<AnalysisResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleFileSelect = useCallback((file: File) => {
		setSelectedFile(file);
		setResult(null);
		setError(null);
	}, []);

	const handlePromptChange = useCallback((newPrompt: string) => {
		setPrompt(newPrompt);
	}, []);

	const handleAnalyze = useCallback(async () => {
		if (!selectedFile || !prompt.trim()) {
			setError("Please select a file and enter a prompt");
			return;
		}

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const analysisResult = await analyzeDocument(selectedFile, prompt);
			setResult(analysisResult);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || "An error occurred during analysis");
		} finally {
			setIsLoading(false);
		}
	}, [selectedFile, prompt]);

	const handleReset = useCallback(() => {
		setSelectedFile(null);
		setPrompt("");
		setResult(null);
		setError(null);
	}, []);

	const canAnalyze = selectedFile && prompt.trim() && !isLoading;

	return (
		<div className="document-analyzer">
			<div className="analyzer-container">
				{/* File Upload Section */}
				<div className="section">
					<h2>📎 Upload Document</h2>
					<FileUpload
						onFileSelect={handleFileSelect}
						selectedFile={selectedFile}
						disabled={isLoading}
					/>
				</div>

				{/* Prompt Input Section */}
				<div className="section">
					<h2>💬 Enter Your Prompt</h2>
					<PromptInput
						value={prompt}
						onChange={handlePromptChange}
						disabled={isLoading}
						placeholder="What would you like to know about this document? e.g., 'Summarize the key points' or 'What are the main conclusions?'"
					/>
				</div>

				{/* Action Buttons */}
				<div className="section actions">
					<button
						onClick={handleAnalyze}
						disabled={!canAnalyze}
						className="analyze-button"
					>
						{isLoading ? "Analyzing..." : "🔍 Analyze Document"}
					</button>
					{(selectedFile || prompt || result || error) && (
						<button
							onClick={handleReset}
							disabled={isLoading}
							className="reset-button"
						>
							🔄 Reset
						</button>
					)}
				</div>

				{/* Loading Spinner */}
				{isLoading && (
					<div className="section">
						<LoadingSpinner message="Analyzing your document..." />
					</div>
				)}

				{/* Error Display */}
				{error && (
					<div className="section error-section">
						<div className="error-message">
							<h3>❌ Error</h3>
							<p>{error}</p>
						</div>
					</div>
				)}

				{/* Results Display */}
				{result && (
					<div className="section results-section">
						<AnalysisResponse result={result} />
					</div>
				)}
			</div>
		</div>
	);
};

export default DocumentAnalyzer;
