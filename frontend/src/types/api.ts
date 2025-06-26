export interface DocumentMetadata {
	title: string;
	file_type: string;
	file_size: number;
	page_count?: number;
	tables_count: number;
	images_count: number;
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
	metadata: {
		document: DocumentMetadata;
		usage: UsageInfo;
		model: string;
	};
}

export interface SupportedFormatsResponse {
	success: boolean;
	formats: string[];
	max_file_size_mb: number;
}

export interface ValidationResponse {
	success: boolean;
	message?: string;
	error?: string;
}
