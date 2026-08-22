import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

declare const toastr: any;

@Component({
	selector: 'app-upload-file-import',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './upload-file-import.component.html',
	styleUrl: './upload-file-import.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UploadFileImportComponent implements OnChanges {
	@Input() inputId = `fileInput-${Math.random().toString(36).substring(2, 9)}`;

	@Input() hasError: string | boolean | string[] | null = null;
	@Input() previewImage: string | false | null = null;

	@Output() fileSelected = new EventEmitter<File | null>();
	@Output() validationError = new EventEmitter<string | null>();

	public imagePreview: string | null = null;
	public fileName: string | null = null;

	private readonly allowedExtensions = ['xls', 'xlsx', 'csv'];

	private readonly allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];

	private readonly maxFileSize = 10 * 1024 * 1024;

	ngOnChanges(changes: SimpleChanges): void {
		const previewChange = changes['previewImage'];

		if (!previewChange) {
			return;
		}

		const preview = previewChange.currentValue;

		if (typeof preview === 'string' && preview.length > 0) {
			this.imagePreview = preview;
			this.fileName = preview.split('/').pop() || 'Archivo seleccionado';
			return;
		}

		if (!preview) {
			this.imagePreview = null;
			this.fileName = null;
		}
	}

	onFileChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) {
			return;
		}

		const extension = this.getFileExtension(file.name);

		if (!this.isAllowedFile(file, extension)) {
			this.setError('Solo se permiten archivos Excel (.xls, .xlsx) o CSV.', input);
			return;
		}

		if (file.size > this.maxFileSize) {
			this.setError('El archivo debe pesar menos de 10 MB.', input);
			return;
		}

		this.fileName = file.name;
		this.imagePreview = extension === 'csv' ? 'images/svg/csv-file.png' : 'images/svg/xls.png';

		this.fileSelected.emit(file);
		this.validationError.emit(null);
	}

	clearImage(event?: Event): void {
		event?.preventDefault();
		event?.stopPropagation();

		this.imagePreview = null;
		this.fileName = null;

		this.resetInput();

		this.fileSelected.emit(null);
		this.validationError.emit(null);
	}

	private getFileExtension(fileName: string): string {
		return fileName.split('.').pop()?.toLowerCase() ?? '';
	}

	private isAllowedFile(file: File, extension: string): boolean {
		const hasAllowedExtension = this.allowedExtensions.includes(extension);

		/*
		 * Algunos navegadores no proporcionan el MIME de archivos CSV.
		 * Por eso también se valida la extensión.
		 */
		const hasAllowedType = !file.type || this.allowedTypes.includes(file.type);

		return hasAllowedExtension && hasAllowedType;
	}

	private setError(message: string, input: HTMLInputElement): void {
		this.imagePreview = null;
		this.fileName = null;

		input.value = '';

		this.fileSelected.emit(null);
		this.validationError.emit(message);

		if (typeof toastr !== 'undefined') {
			toastr.error(message);
		}
	}

	private resetInput(): void {
		const input = document.getElementById(this.inputId) as HTMLInputElement | null;

		if (input) {
			input.value = '';
		}
	}
}
