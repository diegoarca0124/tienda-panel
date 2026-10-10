export interface ImageUploadConfig {
	readonly allowedMimeTypes: readonly string[];
	readonly maxSizeBytes: number;
}

const MEGABYTE = 1024 * 1024;
const IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'] as const;

export const DEFAULT_IMAGE_UPLOAD_CONFIG: ImageUploadConfig = {
	allowedMimeTypes: IMAGE_FORMATS,
	maxSizeBytes: 3 * MEGABYTE,
};
