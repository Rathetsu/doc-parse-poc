export const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 Bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const isFileTypeSupported = (filename: string): boolean => {
	const supportedExtensions = [
		".pdf",
		".docx",
		".pptx",
		".png",
		".jpg",
		".jpeg",
		".gif",
		".tiff",
	];

	const fileExtension = filename
		.toLowerCase()
		.substring(filename.lastIndexOf("."));
	return supportedExtensions.includes(fileExtension);
};

export const getFileExtension = (filename: string): string => {
	return filename.toLowerCase().substring(filename.lastIndexOf("."));
};

export const truncateFilename = (
	filename: string,
	maxLength: number = 30
): string => {
	if (filename.length <= maxLength) return filename;

	const extension = getFileExtension(filename);
	const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
	const truncatedName = nameWithoutExt.substring(
		0,
		maxLength - extension.length - 3
	);

	return `${truncatedName}...${extension}`;
};
