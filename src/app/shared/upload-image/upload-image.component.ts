import { Component, effect, EventEmitter, Input, Output, signal, Signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { urlToImage } from '@app/common/utils/url-to-image.util';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-upload-image',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule, FallbackImageDirective],
	templateUrl: './upload-image.component.html',
	styleUrls: ['./upload-image.component.css'],
})
export class UploadImageComponent {
	imagePreview: string | ArrayBuffer | null = null;
	fileName: string | null = null;

	@Output() fileSelected = new EventEmitter<File | null>();
	@Output() validationError = new EventEmitter<string | null>();
	@Input() aspectMode: 'square' | 'rectangle' | '2:1' | 'all' = 'square';
	@Input() inputId: any = `fileInput-${Math.random().toString(36).substring(2, 9)}`;
	@Input() hasError: any = '';
	@Input() previewImage: any = false;
	public isLoading = false;

	constructor() {}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['previewImage'] && changes['previewImage'].currentValue) {
			this.imagePreview = changes['previewImage'].currentValue;
			this.fileName = this.previewImage.split('/').pop() || '';
		}
	}

	ngOnInit() {}

	onFileChange(event: Event): void {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			const file = input.files[0];

			// Validar tipo
			if (!file.type.startsWith('image/')) {
				this.setError('Solo se permiten imágenes.');
				return;
			}

			// Validar tamaño (2MB)
			const maxSize = 3 * 1024 * 1024;
			if (file.size > maxSize) {
				this.setError('La imagen no puede superar los 2MB.');
				return;
			}

			// Validar cuadrada
			const img = new Image();
			const reader = new FileReader();

			reader.onload = (e: any) => {
				img.src = e.target.result;
				img.onload = () => {
					// ✅ Válida
					this.fileName = file.name;
					this.imagePreview = e.target.result;
					this.fileSelected.emit(file);
					this.validationError.emit(null); // limpia error
					this.hasError = false;
					console.log(this.hasError);
				};
			};

			reader.readAsDataURL(file);
		}
	}

	clearImage(): void {
		this.imagePreview = null;
		this.fileName = null;
		this.fileSelected.emit(null);
		this.validationError.emit(null);
		this.hasError = false;
		$('#' + this.inputId).val('');
	}

	private setError(message: string) {
		toastr.error(message);
		this.imagePreview = null;
		this.fileName = null;
		this.fileSelected.emit(null);
		this.validationError.emit(message);
		this.hasError = true;
	}
}
