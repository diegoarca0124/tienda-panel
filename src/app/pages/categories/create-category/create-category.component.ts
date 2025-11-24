import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Category } from '@app/common/interface/category.interface';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { CategoryService } from '@app/services/category.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
declare const toastr: any;

@Component({
	selector: 'app-create-category',
	imports: [TopbarComponent, SidebarComponent, FormsModule, CommonModule, RouterModule, AlertComponent],
	templateUrl: './create-category.component.html',
	styleUrl: './create-category.component.css',
})
export class CreateCategoryComponent {
	@ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
	editorView!: EditorView;
	private destroy$ = new Subject<void>();
	public loadBtn: boolean = false;
	public errorsCategory: any = {};
	public msmErrorCategory: any = [];
	public errorMsmServer: string = '';
	public category: Category = {
		name: '',
		slug: '',
		icon: '',
		description: '',
	};

	constructor(
		private categoryService: CategoryService,
		private _router: Router
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	create() {
		this.loadBtn = true;
		this.categoryService
			.create_category(this.category)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next) => {
					this.errorsCategory = {};
					toastr.success('Categoría creada correctamente.');
					this._router.navigate(['/products/categories']);
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (error.validation) {
						this.errorsCategory = error.validation;
						this.msmErrorCategory =Object.values(this.errorsCategory).flat();
						this.errorMsmServer = '';
					}
				},
			});
	}
}
