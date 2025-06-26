import React, { useState, useEffect } from "react";
import { getOutputFormats } from "../services/api";
import { OutputFormat } from "../types/api";
import "./OutputFormatSelector.css";

interface OutputFormatSelectorProps {
	value: OutputFormat;
	onChange: (format: OutputFormat) => void;
	disabled?: boolean;
}

const OutputFormatSelector: React.FC<OutputFormatSelectorProps> = ({
	value,
	onChange,
	disabled = false,
}) => {
	const [availableFormats, setAvailableFormats] = useState<OutputFormat[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchFormats = async () => {
			try {
				setLoading(true);
				const response = await getOutputFormats();
				setAvailableFormats(response.output_formats as OutputFormat[]);
				setError(null);
			} catch (err) {
				console.error("Failed to fetch output formats:", err);
				setError("Failed to load output formats");
				// Fallback to default formats
				setAvailableFormats(["markdown", "json", "text", "html"]);
			} finally {
				setLoading(false);
			}
		};

		fetchFormats();
	}, []);

	const formatDisplayNames: Record<OutputFormat, string> = {
		markdown: "Markdown",
		json: "JSON",
		text: "Plain Text",
		html: "HTML",
	};

	const formatDescriptions: Record<OutputFormat, string> = {
		markdown: "Clean, formatted text with structure preserved",
		json: "Complete structured data including tables and metadata",
		text: "Simple plain text without formatting",
		html: "HTML formatted content",
	};

	if (loading) {
		return (
			<div className="output-format-selector">
				<label className="format-label">Output Format</label>
				<div className="format-loading">Loading formats...</div>
			</div>
		);
	}

	return (
		<div className="output-format-selector">
			<label className="format-label">
				📄 Output Format
				{error && <span className="format-error"> - {error}</span>}
			</label>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as OutputFormat)}
				disabled={disabled}
				className="format-select"
			>
				{availableFormats.map((format) => (
					<option key={format} value={format}>
						{formatDisplayNames[format]}
					</option>
				))}
			</select>
			<div className="format-description">{formatDescriptions[value]}</div>
		</div>
	);
};

export default OutputFormatSelector;
