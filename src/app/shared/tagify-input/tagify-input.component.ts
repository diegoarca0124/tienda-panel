import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, OnChanges, OnDestroy, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Tagify from '@yaireo/tagify';

export interface TagifyOption {
	value: string;
	name: string;
}

@Component({
	selector: 'app-tagify-input',
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: './tagify-input.component.html',
	styleUrl: './tagify-input.component.css',
	encapsulation: ViewEncapsulation.None,
})
export class TagifyInputComponent implements OnChanges, OnDestroy {
	@Input() whiteList: (string | TagifyOption)[] = [];
	@Input() selectedTags: string[] = [];
	@Input() inputId = '';
	@Input() placeholder = 'Escribe y presiona Enter';
	@Input() enforceWhitelist = false;
	@Input() maxTags = 20;
	@Input() disabled = false;
	@Input() loading = false;
	@Input() invalid = false;
	@Input() describedBy = '';
	@Input() labelledBy = '';

	@Output() tagsChange = new EventEmitter<string[]>();

	@ViewChild('tagHost')
	set tagHost(host: ElementRef<HTMLDivElement> | undefined) {
		// Angular can replace this host during template hot reload while retaining
		// the component instance. Recreate Tagify whenever its host changes.
		if (host?.nativeElement.contains(this.tagify?.DOM.scope ?? null)) return;
		this.destroyTagify();
		if (!host) return;
		const input = host.nativeElement.ownerDocument.createElement('input');
		input.placeholder = this.placeholder;
		input.disabled = this.disabled;
		host.nativeElement.appendChild(input);
		this.initTagify(input);
	}

	private tagify?: Tagify<TagifyOption>;
	private syncingTags = false;

	private get options(): TagifyOption[] {
		return this.whiteList.map((option) => (typeof option === 'string' ? { value: option, name: option } : option));
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!this.tagify) return;

		if (changes['whiteList']) {
			this.tagify.settings.whitelist = this.options;
		}
		this.syncState();
		if (changes['selectedTags'] || changes['whiteList']) this.syncSelectedTags();
	}

	private initTagify(input: HTMLInputElement): void {
		// Tagify reads CSS transition settings during construction.
		input.classList.add('app-tagify');
		this.tagify = new Tagify<TagifyOption>(input, {
			whitelist: this.options,
			maxTags: this.enforceWhitelist ? Infinity : this.maxTags,
			enforceWhitelist: this.enforceWhitelist,
			tagTextProp: this.enforceWhitelist ? 'name' : 'value',
			editTags: this.enforceWhitelist ? false : 2,
			delimiters: this.enforceWhitelist ? '' : ',',
			dropdown: {
				enabled: this.enforceWhitelist ? 0 : 1,
				position: 'all',
				classname: 'app-tagify-dropdown',
				mapValueTo: this.enforceWhitelist ? 'name' : 'value',
				searchKeys: this.enforceWhitelist ? ['name'] : ['value'],
				closeOnSelect: false,
			},
		});

		input.classList.remove('app-tagify');
		this.syncSelectedTags();
		this.syncState();

		this.tagify.on('add', () => this.emitTags());
		this.tagify.on('remove', () => this.emitTags());
	}

	private syncSelectedTags(): void {
		if (!this.tagify) return;
		const current = this.tagify.value.map((item) => item.value);
		if (JSON.stringify(current) === JSON.stringify(this.selectedTags)) return;
		// Silent updates prevent intermediate empty selections from reaching the parent.
		this.syncingTags = true;
		try {
			this.tagify.removeAllTags({ withoutChangeEvent: true });
			const options = this.options;
			this.tagify.addTags(this.selectedTags.map((value) => options.find((option) => option.value === value) || { value, name: value }));
		} finally {
			this.syncingTags = false;
		}
	}

	private syncState(): void {
		if (!this.tagify) return;
		if (this.tagify.settings.disabled !== this.disabled) this.tagify.setDisabled(this.disabled);
		// Tagify forces this to false when initialized on a disabled input.
		// setDisabled(false) restores editing, but does not restore the dropdown.
		this.tagify.settings.dropdown.enabled = this.disabled ? false : this.enforceWhitelist ? 0 : 1;
		this.tagify.loading(this.loading);
		this.tagify.settings.maxTags = this.enforceWhitelist ? Infinity : this.maxTags;
		this.tagify.DOM.input.setAttribute('data-placeholder', this.placeholder);
		this.tagify.DOM.input.setAttribute('aria-placeholder', this.placeholder);
		this.tagify.DOM.scope.classList.toggle('app-tagify-invalid', this.invalid);
		this.tagify.DOM.input.id = this.inputId;
		this.tagify.DOM.input.setAttribute('aria-invalid', String(this.invalid));
		this.tagify.DOM.input.setAttribute('aria-describedby', this.describedBy);
		this.tagify.DOM.input.setAttribute('aria-labelledby', this.labelledBy);
		if (this.disabled) this.tagify.dropdown.hide();
	}

	focus(): void {
		if (!this.disabled) this.tagify?.DOM.input.focus();
	}

	private emitTags(): void {
		if (this.syncingTags) return;
		const tags = this.tagify?.value.map((item) => item.value) || [];

		this.tagsChange.emit(tags);
	}

	ngOnDestroy(): void {
		this.destroyTagify();
	}

	private destroyTagify(): void {
		if (this.tagify) {
			this.tagify.destroy();
			this.tagify = undefined;
		}
	}
}
