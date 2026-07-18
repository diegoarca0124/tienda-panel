import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { EditorState } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { oneDark } from '@codemirror/theme-one-dark';
import { CategoryService } from '@app/services/category.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { TextFieldModule } from '@angular/cdk/text-field';
import { IMaskModule } from 'angular-imask';
import { CategoryInterface } from '../interfaces/category.interface';
import { createEmptyCategory } from '../utils/empties.util';
import { showErrorsCategory } from '../constants/show-errors-category.constant';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
declare const toastr: any;
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoOptions } from '../constants/monaco-options.constant';
import { DomSanitizer } from '@angular/platform-browser';
import { InputSvgComponent } from '@app/shared/input-svg/input-svg.component';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-create-category',
	standalone: true,
	imports: [TopbarComponent, SidebarComponent, FormsModule, CommonModule, RouterModule, AlertComponent, TextFieldModule, IMaskModule, ValidationPopoverComponent, InputSvgComponent, TextareaAutoresizeDirective ],
	templateUrl: './create-category.component.html',
	styleUrl: './create-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateCategoryComponent {
	@ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
	private destroy$ = new Subject<void>();
	public loadBtn: boolean = false;
	public errorsCategory: any = {};
	public msmErrorCategory: any = [];
	public category: CategoryInterface = createEmptyCategory();
	public prefixMask = {
		mask: /^[A-Z]{0,3}$/,
		prepare: (str: string) => str.toUpperCase()
	};
	public showErrors = showErrorsCategory;

	

	constructor(
		private categoryService: CategoryService,
		private _router: Router,
		
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	create() {
		this.msmErrorCategory = [];
		this.loadBtn = true;
		if(this.category.icon == null) this.category.icon = "";
		this.categoryService
			.create_category(this.category)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: {data: [], message: string}) => {
					this.errorsCategory = {};
					toastr.success(next.message);
					this._router.navigate(['/products/categories']);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.errorsCategory = error.validation;
						this.msmErrorCategory =Object.values(this.errorsCategory).flat();
						for (const key in this.showErrors) {
							this.showErrors[key as keyof typeof this.showErrors] =
							!!this.errorsCategory?.[key]?.length;
						}	
					}
				},
			});
	}

	

	
}
