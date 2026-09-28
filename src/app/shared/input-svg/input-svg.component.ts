import { AfterViewInit, Component, ElementRef, Input, NgZone, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { html } from '@codemirror/lang-html';
import { basicSetup, EditorView } from 'codemirror';

@Component({
	selector: 'app-input-svg',
	imports: [],
	templateUrl: './input-svg.component.html',
	styleUrl: './input-svg.component.css',
})
export class InputSvgComponent implements AfterViewInit, OnChanges, OnDestroy {
	@ViewChild('editorHost', { static: true }) private editorHost!: ElementRef<HTMLDivElement>;

	private editor?: EditorView;
	@Input() data: any = {};
	@Input({ required: true }) errors!: any;

	constructor(private ngZone: NgZone) {}

	ngAfterViewInit(): void {
		const initialValue = this.data?.icon ?? '';

		this.editor = new EditorView({
			doc: initialValue,
			extensions: [
				basicSetup,
				html({
					autoCloseTags: true,
					matchClosingTags: true,
				}),
				EditorView.lineWrapping,
				EditorView.theme({
					'&': {
						height: '250px',
						color: '#252f4a',
						backgroundColor: '#ffffff',
						fontSize: '13px',
					},
					'&.cm-focused': {
						outline: 'none',
					},
					'.cm-scroller': {
						fontFamily: 'Consolas, "Courier New", monospace',
						lineHeight: '1.65',
					},
					'.cm-content': {
						padding: '12px 0',
						caretColor: '#1b84ff',
					},
					'.cm-line': {
						padding: '0 12px',
					},
					'.cm-gutters': {
						color: '#99a1b7',
						backgroundColor: '#f8fafc',
						borderRight: '1px solid #edf0f3',
					},
					'.cm-activeLine, .cm-activeLineGutter': {
						backgroundColor: '#f5f9ff',
					},
					'&.cm-focused .cm-selectionBackground, ::selection': {
						backgroundColor: '#d8eaff !important',
					},
				}),
				EditorView.updateListener.of((update) => {
					if (!update.docChanged) return;

					const value = update.state.doc.toString();
					this.ngZone.run(() => {
						this.data.icon = value;
					});
				}),
			],
			parent: this.editorHost.nativeElement,
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (!changes['data']) return;

		const value = this.data?.icon ?? '';
		this.replaceEditorValue(value);
	}

	ngOnDestroy(): void {
		this.editor?.destroy();
	}

	private replaceEditorValue(value: string): void {
		if (!this.editor) return;

		const currentValue = this.editor.state.doc.toString();
		if (currentValue === value) return;

		this.editor.dispatch({
			changes: {
				from: 0,
				to: currentValue.length,
				insert: value,
			},
		});
	}
}
