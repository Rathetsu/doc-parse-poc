import React, { useState, useCallback } from "react";
import FileUpload from "./FileUpload";
import PromptInput from "./PromptInput";
import AnalysisResponse from "./AnalysisResponse";
import LoadingSpinner from "./LoadingSpinner";
import OutputFormatSelector from "./OutputFormatSelector";
import ParsedContentDisplay from "./ParsedContentDisplay";
import { analyzeDocument, ApiError } from "../services/api";
import { AnalysisResult, OutputFormat } from "../types/api";
import "./DocumentAnalyzer.css";

const DocumentAnalyzer: React.FC = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [prompt, setPrompt] = useState<string>("");
	const [outputFormat, setOutputFormat] = useState<OutputFormat>("markdown");
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

	const handleOutputFormatChange = useCallback((format: OutputFormat) => {
		setOutputFormat(format);
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
			const analysisResult = await analyzeDocument(
				selectedFile,
				prompt,
				outputFormat
			);
			setResult(analysisResult);
		} catch (err) {
			const apiError = err as ApiError;
			setError(apiError.message || "An error occurred during analysis");
		} finally {
			setIsLoading(false);
		}
	}, [selectedFile, prompt, outputFormat]);

	const handleReset = useCallback(() => {
		setSelectedFile(null);
		setPrompt("");
		setOutputFormat("markdown");
		setResult(null);
		setError(null);
	}, []);

	const canAnalyze = !!(selectedFile && prompt.trim() && !isLoading);
	const showReset = !!(selectedFile || prompt || result || error);

	return (
		<div className="document-analyzer">
			<div className="analyzer-container">
				{/* Input Section - File Upload and Prompt side by side */}
				<div className="input-section">
					<div className="upload-area">
						<FileUpload
							onFileSelect={handleFileSelect}
							selectedFile={selectedFile}
							disabled={isLoading}
						/>
						{/* Output Format Selector */}
						{selectedFile && (
							<OutputFormatSelector
								value={outputFormat}
								onChange={handleOutputFormatChange}
								disabled={isLoading}
							/>
						)}
					</div>
					<div className="prompt-area">
						<PromptInput
							value={prompt}
							onChange={handlePromptChange}
							disabled={isLoading}
							placeholder="What would you like to know about this document?"
							onAnalyze={handleAnalyze}
							canAnalyze={canAnalyze}
							isAnalyzing={isLoading}
						/>
					</div>
				</div>

				{/* Reset Button (only when needed) */}
				{showReset && (
					<div className="reset-section">
						<button
							onClick={handleReset}
							disabled={isLoading}
							className="reset-button"
						>
							🔄 Reset
						</button>
					</div>
				)}

				{/* Loading Spinner */}
				{isLoading && (
					<div className="loading-section">
						<LoadingSpinner message="Analyzing your document..." />
					</div>
				)}

				{/* Error Display */}
				{error && (
					<div className="error-section">
						<div className="error-message">
							<h3>❌ Error</h3>
							<p>{error}</p>
						</div>
					</div>
				)}

				{/* Results Display */}
				{result && (
					<div className="results-section">
						{/* Display parsed content if available */}
						{result.parsed_content && (
							<ParsedContentDisplay
								content={result.parsed_content}
								format={
									(result.metadata.document.output_format as OutputFormat) ||
									outputFormat
								}
								title="Document Parsing Result"
							/>
						)}

						{/* Display LLM analysis */}
						<AnalysisResponse result={result} />
					</div>
				)}
			</div>
		</div>
	);
};

export default DocumentAnalyzer;
