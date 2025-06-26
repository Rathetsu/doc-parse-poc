export interface DocumentMetadata {
	title: string;
	file_type: string;
	file_size: number;
	page_count?: number;
	tables_count: number;
	images_count: number;
	output_format?: string;
}

export interface UsageInfo {
	prompt_tokens: number;
	completion_tokens: number;
	total_tokens: number;
	model_used: string;
}

export interface AnalysisResult {
	success: boolean;
	analysis: string;
	parsed_content?: string;
	metadata: {
		document: DocumentMetadata;
		usage: UsageInfo;
		model: string;
	};
}

export interface ParseResult {
	success: boolean;
	content: string;
	metadata: DocumentMetadata;
}

export interface SupportedFormatsResponse {
	success: boolean;
	formats: string[];
	max_file_size_mb: number;
}

export interface OutputFormatsResponse {
	success: boolean;
	output_formats: string[];
}

export interface ValidationResponse {
	success: boolean;
	message?: string;
	error?: string;
}

export type OutputFormat = "markdown" | "json" | "text" | "html";
