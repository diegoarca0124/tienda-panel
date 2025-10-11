import { Component, effect, EventEmitter, Input, Output, signal, Signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { urlToImage } from '@app/common/utils/url-to-image.util';

@Component({
	selector: 'app-upload-image',
	standalone: true,
	imports: [CommonModule, RouterModule, FormsModule],
	templateUrl: './upload-image.component.html',
	styleUrls: ['./upload-image.component.css'],
})
export class UploadImageComponent {
	imagePreview: string | ArrayBuffer | null = null;
	fileName: string | null = null;

	@Output() fileSelected = new EventEmitter<File | null>();
	@Output() validationError = new EventEmitter<string | null>();
	@Input() aspectMode: 'square' | 'rectangle' | '2:1' = 'square';
	@Input() inputId: any = `fileInput-${Math.random().toString(36).substring(2, 9)}`;
	@Input() hasError: any = '';
	@Input() previewImage: any = false;

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
					switch (this.aspectMode) {
						case 'square':
							if (img.width !== img.height) {
								this.setError('La imagen debe ser cuadrada.');
								return;
							}
							break;

						case 'rectangle':
							if (img.width <= img.height) {
								this.setError('La imagen debe ser horizontal (más ancha que alta).');
								return;
							}
							break;

						case '2:1':
							const ratio = img.width / img.height;
							if (Math.abs(ratio - 2) > 0.05) {
								// 👉 tolerancia del 5% para evitar errores por 1px
								this.setError('La imagen debe tener relación 2:1 (ejemplo: 1200x600).');
								return;
							}
							break;
					}

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
	}

	private setError(message: string) {
		console.log(message);

		this.imagePreview = null;
		this.fileName = null;
		this.fileSelected.emit(null);
		this.validationError.emit(message); // 👉 avisar al padre
		this.hasError = true;
	}
}
