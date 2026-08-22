import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Tagify from '@yaireo/tagify';

@Component({
	selector: 'app-tagify-input',
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: './tagify-input.component.html',
	styleUrl: './tagify-input.component.css',
})
export class TagifyInputComponent implements AfterViewInit, OnChanges, OnDestroy {
	@Input() whiteList: string[] = [];
	@Input() selectedTags: string[] = [];

	@Output() tagsChange = new EventEmitter<string[]>();

	@ViewChild('tagInput', { static: true })
	tagInput!: ElementRef<HTMLInputElement>;

	private tagify?: Tagify;

	ngAfterViewInit(): void {
		this.initTagify();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!this.tagify) return;

		if (changes['selectedTags']) {
			const prev = changes['selectedTags'].previousValue || [];
			const curr = changes['selectedTags'].currentValue || [];

			if (JSON.stringify(prev) !== JSON.stringify(curr)) {
				this.tagify.removeAllTags();

				if (curr.length) {
					this.tagify.addTags(curr);
				}
			}
		}

		if (changes['whiteList']) {
			this.tagify.settings.whitelist = this.whiteList;
		}
	}

	private initTagify(): void {
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
		if (tagifyEl) {
			tagifyEl.classList.add('form-control', 'py-2');
		}

		// cargar tags iniciales
		if (this.selectedTags?.length) {
			this.tagify.addTags(this.selectedTags);
		}

		this.tagify.on('add', () => this.emitTags());
		this.tagify.on('remove', () => this.emitTags());
	}

	private emitTags(): void {
		const tags = this.tagify?.value.map((item: any) => item.value) || [];

		this.tagsChange.emit(tags);
	}

	ngOnDestroy(): void {
		if (this.tagify) {
			this.tagify.destroy();
			this.tagify = undefined;
		}
	}
}
