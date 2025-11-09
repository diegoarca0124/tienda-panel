import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Tagify from '@yaireo/tagify';

@Component({
  selector: 'app-tagify-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './tagify-input.component.html',
  styleUrl: './tagify-input.component.css',
})
export class TagifyInputComponent {
  @Input() whiteList: string[] = [];

  // 🔹 Nuevo Output para emitir los cambios
  @Output() tagsChange = new EventEmitter<string[]>();

  @ViewChild('tagInput', { static: true }) tagInput!: ElementRef<HTMLInputElement>;
  private tagify?: Tagify;

  ngAfterViewInit() {
    this.initTagify();
  }

  private initTagify() {
    if (this.tagify) {
      this.tagify.destroy();
    }

    this.tagify = new Tagify(this.tagInput.nativeElement, {
      whitelist: this.whiteList,
      maxTags: 20,
      dropdown: {
        enabled: 1,
        position: 'text',
      },
    });

    const tagifyEl = this.tagInput.nativeElement.closest('.tagify');
    if (tagifyEl) tagifyEl.classList.add('form-control', 'py-2');

    // 🔹 Emitir cuando se agrega o elimina una etiqueta
    this.tagify.on('add', () => this.emitTags());
    this.tagify.on('remove', () => this.emitTags());
  }

  private emitTags() {
    const tags = this.tagify?.value.map((t: any) => t.value) || [];
    this.tagsChange.emit(tags);
  }

  ngOnDestroy() {
    if (this.tagify) {
      this.tagify.destroy();
      this.tagify = undefined;
    }
  }
}
