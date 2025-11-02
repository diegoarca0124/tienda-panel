import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Tagify from '@yaireo/tagify';

@Component({
	selector: 'app-tagify-input',
	imports: [FormsModule, CommonModule],
	templateUrl: './tagify-input.component.html',
	styleUrl: './tagify-input.component.css',
})
export class TagifyInputComponent {
	@Input() whiteList: string[] = [];
	@ViewChild('tagInput', { static: true }) tagInput!: ElementRef<HTMLInputElement>;
	private tagify?: Tagify;

	ngAfterViewInit() {
		this.initTagify();
	}

	private initTagify() {
		// 🔹 Destruye instancia anterior si existe (por hot reload)
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

		// 🔹 Agregar clases de Bootstrap
		const tagifyEl = this.tagInput.nativeElement.closest('.tagify');
		if (tagifyEl) tagifyEl.classList.add('form-control', 'py-2');

		// 🔹 Escuchar eventos
		this.tagify.on('add', (e) => console.log('Etiqueta agregada:', e.detail.data));
		this.tagify.on('remove', (e) => console.log('Etiqueta eliminada:', e.detail.data));
	}

	ngOnDestroy() {
		if (this.tagify) {
			this.tagify.destroy();
			this.tagify = undefined;
		}
	}
}
