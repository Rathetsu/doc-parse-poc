import React, { useState } from "react";
import { OutputFormat } from "../types/api";
import "./ParsedContentDisplay.css";

interface ParsedContentDisplayProps {
	content: string;
	format: OutputFormat;
	title?: string;
}

const ParsedContentDisplay: React.FC<ParsedContentDisplayProps> = ({
	content,
	format,
	title = "Parsed Document Content",
}) => {
	const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
	const [copySuccess, setCopySuccess] = useState<boolean>(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(content);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	const formatDisplayName = (fmt: OutputFormat): string => {
		const names: Record<OutputFormat, string> = {
			markdown: "Markdown",
			json: "JSON",
			text: "Plain Text",
			html: "HTML",
		};
		return names[fmt];
	};

	const getContentPreview = (
		content: string,
		maxLength: number = 200
	): string => {
		if (content.length <= maxLength) return content;
		return content.substring(0, maxLength) + "...";
	};

	const formatContent = (
		content: string,
		format: OutputFormat
	): React.ReactNode => {
		switch (format) {
			case "json":
				try {
					const parsed = JSON.parse(content);
					return (
						<pre className="json-content">
							{JSON.stringify(parsed, null, 2)}
						</pre>
					);
				} catch {
					return <pre className="text-content">{content}</pre>;
				}
			case "html":
				return <pre className="html-content">{content}</pre>;
			case "markdown":
				return <pre className="markdown-content">{content}</pre>;
			case "text":
				return <pre className="text-content">{content}</pre>;
			default:
				return <pre className="text-content">{content}</pre>;
		}
	};

	return (
		<div className="parsed-content-display">
			<div className="content-header">
				<div className="header-left">
					<h3 className="content-title">📄 {title}</h3>
					<span className="format-badge">{formatDisplayName(format)}</span>
				</div>
				<div className="header-actions">
					<button
						onClick={handleCopy}
						className="copy-button"
						title="Copy to clipboard"
					>
						{copySuccess ? "✅ Copied!" : "📋 Copy"}
					</button>
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="collapse-button"
						title={isCollapsed ? "Expand" : "Collapse"}
					>
						{isCollapsed ? "⬇️ Expand" : "⬆️ Collapse"}
					</button>
				</div>
			</div>

			{isCollapsed ? (
				<div className="content-preview">
					<div className="preview-text">{getContentPreview(content)}</div>
					<button onClick={() => setIsCollapsed(false)} className="expand-link">
						Click to expand full content
					</button>
				</div>
			) : (
				<div className="content-body">{formatContent(content, format)}</div>
			)}
		</div>
	);
};

export default ParsedContentDisplay;
