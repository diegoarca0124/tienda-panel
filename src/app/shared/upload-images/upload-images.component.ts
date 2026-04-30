import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { IconUploadComponent } from '@app/icons/icon-upload/icon-upload.component';
declare var refreshFsLightbox: any;

@Component({
  selector: 'app-upload-images',
  imports: [
    IconUploadComponent,
    CommonModule
  ],
  templateUrl: './upload-images.component.html',
  styleUrl: './upload-images.component.css'
})
export class UploadImagesComponent {

  @Output() filesSelected = new EventEmitter<Array<{ file: File, preview: string }>>();
  @Input() inputId = `fileInput-${Math.random().toString(36).substring(2, 9)}`;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  public isDragging = false;
  public isLoading = false;

  // ⭐ EVENTOS DEL DRAG & DROP ---------------------------------------------

  @HostListener('dragover', ['$event'])
  onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isDragging = false;

    if (!evt.dataTransfer?.files?.length) return;

    this.processFiles(evt.dataTransfer.files);
  }

  // ⭐ EVENTO INPUT NORMAL -------------------------------------------------

  onFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.processFiles(input.files);
  }

  // ⭐ PROCESAR IMÁGENES --------------------------------------------------

  private processFiles(fileList: FileList) {
    const maxSize = 3 * 1024 * 1024;
    const result: { file: File, preview: string }[] = [];

    const validFiles = Array.from(fileList).filter(f =>
      f.type.startsWith('image/') && f.size <= maxSize
    );

    if (!validFiles.length) {
      this.clearInput();
      this.filesSelected.emit([]);
      return;
    }

    this.isLoading = true;

    let loaded = 0;

    validFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        result.push({
          file,
          preview: e.target.result
        });

        loaded++;

        if (loaded === validFiles.length) {
          setTimeout(() => {
            this.isLoading = false;
            this.filesSelected.emit(result);
            this.clearInput(); 
          }, 1200);
        }
      };

    reader.readAsDataURL(file);
    });
  }

  private clearInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
