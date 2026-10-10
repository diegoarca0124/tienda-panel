import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, type OnChanges, type OnDestroy, type SimpleChanges } from '@angular/core';
import { DEFAULT_IMAGE_UPLOAD_CONFIG, type ImageUploadConfig } from '@app/common/constants/file-upload.constant';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';

declare const toastr: { error(message: string): void };

@Component({
	selector: 'app-upload-image',
	standalone: true,
	imports: [CommonModule, FallbackImageDirective],
	templateUrl: './upload-image.component.html',
	styleUrls: ['./upload-image.component.css'],
})
export class UploadImageComponent implements OnChanges, OnDestroy {
	@Input() inputId = `fileInput-${Math.random().toString(36).substring(2, 9)}`;
	@Input() aspectMode: 'square' | 'rectangle' | '2:1' | 'all' = 'square';
	@Input() hasError: boolean | string | null | undefined = false;
	@Input() previewImage: string | null = null;
	@Input() fileConfig: ImageUploadConfig = DEFAULT_IMAGE_UPLOAD_CONFIG;

	@Output() fileSelected = new EventEmitter<File | null>();
	@Output() imageValidationError = new EventEmitter<string | null>();

	@ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;
	private selectionId = 0;

	public imagePreview: string | null = null;
	public fileName: string | null = null;
	public isLoading = false;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['previewImage']) {
			this.selectionId++;
			this.isLoading = false;
			this.imagePreview = this.previewImage || null;
			this.fileName = this.previewImage?.split('/').pop() || null;
		}
	}

	ngOnDestroy(): void {
		this.selectionId++;
	}

	async onFileChange(event: Event): Promise<void> {
		if (this.isLoading) return;

		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Permite volver a seleccionar el mismo archivo, incluso si era inválido.
		input.value = '';
		const selectionId = ++this.selectionId;
		this.isLoading = false;

		const validationError = this.validateFile(file);
		if (validationError) {
			this.setError(validationError);
			return;
		}

		this.resetSelection();
		this.isLoading = true;

		try {
			const preview = await this.readFile(file);
			if (selectionId !== this.selectionId) return;

			await this.checkImage(preview);
			if (selectionId !== this.selectionId) return;

			this.imagePreview = preview;
			this.fileName = file.name;
			this.fileSelected.emit(file);
		} catch (error) {
			if (selectionId === this.selectionId) {
				this.setError(error instanceof Error ? error.message : 'No se pudo cargar la imagen.');
			}
		} finally {
			if (selectionId === this.selectionId) this.isLoading = false;
		}
	}

	clearImage(): void {
		if (this.isLoading) return;

		this.selectionId++;
		this.isLoading = false;
		this.resetSelection();
		if (this.fileInput) this.fileInput.nativeElement.value = '';
	}

	private validateFile(file: File): string | null {
		const { allowedMimeTypes, maxSizeBytes } = this.fileConfig;
		const isAllowedType = allowedMimeTypes.some((type) => (type.endsWith('/*') ? file.type.startsWith(type.slice(0, -1)) : file.type === type));

		if (!isAllowedType) {
			if (allowedMimeTypes.includes('image/*')) return 'Solo se permiten imágenes.';
			const formats = [...new Set(allowedMimeTypes.map((type) => type.split('/')[1].toUpperCase()))];
			return `Formatos permitidos: ${formats.join(', ')}.`;
		}

		if (file.size > maxSizeBytes) {
			return `La imagen no puede superar los ${maxSizeBytes / (1024 * 1024)} MB.`;
		}

		return null;
	}

	private readFile(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === 'string') resolve(reader.result);
				else reject(new Error('No se pudo leer el archivo.'));
			};
			reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
			reader.onabort = () => reject(new Error('La lectura del archivo fue cancelada.'));
			reader.readAsDataURL(file);
		});
	}

	private checkImage(preview: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve();
			image.onerror = () => reject(new Error('El archivo no contiene una imagen válida.'));
			image.src = preview;
		});
	}

	private resetSelection(): void {
		this.imagePreview = null;
		this.fileName = null;
		this.hasError = false;
		this.fileSelected.emit(null);
		this.imageValidationError.emit(null);
	}

	private setError(message: string): void {
		this.imagePreview = null;
		this.fileName = null;
		this.hasError = true;
		this.fileSelected.emit(null);
		this.imageValidationError.emit(message);
		toastr.error(message);
	}
}
