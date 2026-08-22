export const urlToImage = async (url: string, fileName: string, mimeType?: string) => {
	const response = await fetch(url);
	const blob = await response.blob();
	return new File([blob], fileName, { type: mimeType || blob.type });
};
