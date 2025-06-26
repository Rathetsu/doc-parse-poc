import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatFileSize, isFileTypeSupported } from "../utils/fileUtils";
import "./FileUpload.css";

interface FileUploadProps {
	onFileSelect: (file: File) => void;
	selectedFile: File | null;
	disabled?: boolean;
}

const SUPPORTED_FORMATS = [
	"pdf",
	"docx",
	"pptx",
	"png",
	"jpg",
	"jpeg",
	"gif",
	"tiff",
];
const MAX_FILE_SIZE = 16 * 1024 * 1024; // 16MB

const FileUpload: React.FC<FileUploadProps> = ({
	onFileSelect,
	selectedFile,
	disabled = false,
}) => {
	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			if (acceptedFiles.length > 0) {
				const file = acceptedFiles[0];

				// Validate file type
				if (!isFileTypeSupported(file.name)) {
					alert(
						`Unsupported file type. Please use: ${SUPPORTED_FORMATS.join(", ")}`
					);
					return;
				}

				// Validate file size
				if (file.size > MAX_FILE_SIZE) {
					alert(
						`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`
					);
					return;
				}

				onFileSelect(file);
			}
		},
		[onFileSelect]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		disabled,
		multiple: false,
		accept: {
			"application/pdf": [".pdf"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				[".docx"],
			"application/vnd.openxmlformats-officedocument.presentationml.presentation":
				[".pptx"],
			"image/*": [".png", ".jpg", ".jpeg", ".gif", ".tiff"],
		},
	});

	return (
		<div className="file-upload">
			<div
				{...getRootProps()}
				className={`dropzone ${isDragActive ? "active" : ""} ${
					disabled ? "disabled" : ""
				} ${selectedFile ? "has-file" : ""}`}
			>
				<input {...getInputProps()} />

				{selectedFile ? (
					<div className="selected-file">
						<div className="file-icon">📄</div>
						<div className="file-info">
							<div className="file-name">{selectedFile.name}</div>
							<div className="file-details">
								{formatFileSize(selectedFile.size)} •{" "}
								{selectedFile.type || "Unknown type"}
							</div>
						</div>
						{!disabled && (
							<div className="file-actions">
								<span className="change-file-hint">
									Click or drop to change file
								</span>
							</div>
						)}
					</div>
				) : (
					<div className="upload-prompt">
						{isDragActive ? (
							<>
								<div className="upload-icon">📂</div>
								<p>Drop the file here...</p>
							</>
						) : (
							<>
								<div className="upload-icon">📎</div>
								<p className="primary-text">
									Drag & drop a document here, or{" "}
									<span className="link-text">click to browse</span>
								</p>
								<p className="secondary-text">
									Supported formats: {SUPPORTED_FORMATS.join(", ")}
								</p>
								<p className="secondary-text">
									Maximum size: {formatFileSize(MAX_FILE_SIZE)}
								</p>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default FileUpload;
