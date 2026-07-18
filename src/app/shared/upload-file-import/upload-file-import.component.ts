import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
declare const toastr: any;
declare const $:any;

@Component({
  selector: 'app-upload-file-import',
  imports: [
    CommonModule,
  ],
  templateUrl: './upload-file-import.component.html',
  styleUrl: './upload-file-import.component.css'
})
export class UploadFileImportComponent {
  	imagePreview: string | null = "";
	fileName: string | null = null;

	@Output() fileSelected = new EventEmitter<File | null>();
	@Output() validationError = new EventEmitter<string | null>();
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
      const fileExtesion = file.name.split('.').pop()?.toLowerCase()!;
			// Validar tipo
			const allowedTypes = [
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/csv'
      ];

      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      const allowedExtensions = ['xls', 'xlsx', 'csv'];

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        this.setError('Solo se permiten archivos Excel (.xls, .xlsx) o CSV.');
        return;
      }

			// Validar tamaño (2MB)
			const maxSize = 10 * 1024 * 1024;
			if (file.size > maxSize) {
				this.setError('El archivo debe pesar menos de 10Mb.');
				return;
			}
      console.log(fileExtension);
      
			this.fileName = file.name;
      this.imagePreview = (fileExtesion == 'csv') ? 'images/svg/csv-file.png' : 'images/svg/xls.png';
      this.fileSelected.emit(file);
      this.validationError.emit(null);
      this.hasError = false;
		}
	}

	clearImage(): void {
		console.log(this.inputId);
		
		this.imagePreview = null;
		this.fileName = null;
		this.fileSelected.emit(null);
		this.validationError.emit(null);
		this.hasError = false;
		$('#'+this.inputId).val('');
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
