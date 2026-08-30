import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MonacoOptions } from '@app/pages/categories/constants/monaco-options.constant';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
declare const toastr: any;

@Component({
	selector: 'app-input-svg',
	imports: [MonacoEditorModule, CommonModule, FormsModule],
	templateUrl: './input-svg.component.html',
	styleUrl: './input-svg.component.css',
})
export class InputSvgComponent {
	public editorOptions = MonacoOptions;
	public svgPreview: any = undefined;
	@Input() data: any = {};
	@Input({ required: true }) errors!: any;

	constructor(private sanitizer: DomSanitizer) {}

	ngOnInit() {
		if(this.data.icon) this.svgPreview = this.sanitizer.bypassSecurityTrustHtml(this.data.icon);
	}

	updatePreview(svg: string): void {
		this.svgPreview = this.sanitizer.bypassSecurityTrustHtml(svg);
	}
}
