import axios, { AxiosError } from "axios";
import {
	AnalysisResult,
	SupportedFormatsResponse,
	ValidationResponse,
	OutputFormatsResponse,
	ParseResult,
	OutputFormat,
} from "../types/api";

// Environment variable for React apps
declare const process: {
	env: {
		REACT_APP_API_URL?: string;
	};
};

const API_BASE_URL =
	process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 300000, // 5 minutes timeout for document processing
	headers: {
		"Content-Type": "multipart/form-data",
	},
});

export const analyzeDocument = async (
	file: File,
	prompt: string,
	outputFormat: OutputFormat = "markdown"
): Promise<AnalysisResult> => {
	try {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("prompt", prompt);
		formData.append("output_format", outputFormat);

		const response = await api.post<AnalysisResult>("/analyze", formData);

		if (!response.data.success) {
			throw new Error("Analysis failed");
		}

		return response.data;
	} catch (error) {
		const axiosError = error as AxiosError<{ error: string }>;

		if (axiosError.response?.data?.error) {
			throw new ApiError(axiosError.response.data.error);
		} else if (axiosError.message === "timeout of 300000ms exceeded") {
			throw new ApiError(
				"Request timed out. The document might be too large or complex."
			);
		} else if (axiosError.message === "Network Error") {
			throw new ApiError(
				"Unable to connect to the server. Please check if the backend is running."
			);
		} else {
			throw new ApiError(axiosError.message || "An unexpected error occurred");
		}
	}
};

export const parseDocument = async (
	file: File,
	outputFormat: OutputFormat = "markdown"
): Promise<ParseResult> => {
	try {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("output_format", outputFormat);

		const response = await api.post<ParseResult>("/parse", formData);

		if (!response.data.success) {
			throw new Error("Parsing failed");
		}

		return response.data;
	} catch (error) {
		const axiosError = error as AxiosError<{ error: string }>;

		if (axiosError.response?.data?.error) {
			throw new ApiError(axiosError.response.data.error);
		} else if (axiosError.message === "timeout of 300000ms exceeded") {
			throw new ApiError(
				"Request timed out. The document might be too large or complex."
			);
		} else if (axiosError.message === "Network Error") {
			throw new ApiError(
				"Unable to connect to the server. Please check if the backend is running."
			);
		} else {
			throw new ApiError(axiosError.message || "An unexpected error occurred");
		}
	}
};

export const getSupportedFormats =
	async (): Promise<SupportedFormatsResponse> => {
		try {
			const response = await api.get<SupportedFormatsResponse>(
				"/supported-formats"
			);
			return response.data;
		} catch (error) {
			const axiosError = error as AxiosError<{ error: string }>;
			throw new ApiError(
				axiosError.response?.data?.error || "Failed to get supported formats"
			);
		}
	};

export const getOutputFormats = async (): Promise<OutputFormatsResponse> => {
	try {
		const response = await api.get<OutputFormatsResponse>("/output-formats");
		return response.data;
	} catch (error) {
		const axiosError = error as AxiosError<{ error: string }>;
		throw new ApiError(
			axiosError.response?.data?.error || "Failed to get output formats"
		);
	}
};

export const validateFile = async (file: File): Promise<ValidationResponse> => {
	try {
		const formData = new FormData();
		formData.append("file", file);

		const response = await api.post<ValidationResponse>(
			"/validate-file",
			formData
		);
		return response.data;
	} catch (error) {
		const axiosError = error as AxiosError<{ error: string }>;
		throw new ApiError(
			axiosError.response?.data?.error || "File validation failed"
		);
	}
};

export class ApiError extends Error {
	constructor(message: string, public status?: number) {
		super(message);
		this.name = "ApiError";
	}
}
