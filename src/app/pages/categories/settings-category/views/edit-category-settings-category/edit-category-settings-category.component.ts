import { getHttpErrorBody, type HttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { InputSvgComponent } from '@app/shared/input-svg/input-svg.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { IMaskModule } from 'angular-imask';
import { catchError, EMPTY, finalize, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { prefixMask } from '../../../constants/prefix-mask.constant';
import { CategoryInterface } from '../../../interfaces/data.interface';
import { CategoryFieldErrors, CategoryValidationErrors } from '../../../interfaces/validation.interface';
import { createEmptyCategory, createEmptyFieldErrorsCategory } from '../../../utils/empties.util';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';

declare const toastr: any;

@Component({
	selector: 'app-edit-category-settings-category',
	imports: [CommonModule, FormsModule, IMaskModule, NotFoundComponent, ValidationPopoverComponent, InputSvgComponent, TextareaAutoresizeDirective],
	templateUrl: './edit-category-settings-category.component.html',
	styleUrl: './edit-category-settings-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditCategorySettingsCategoryComponent {
	private readonly destroy$ = new Subject<void>();
	private readonly cancelCategoryUpdate$ = new Subject<void>();
	private categoryContextVersion = 0;

	public id = '';
	public category: CategoryInterface = createEmptyCategory();
	public fieldCategoryErrors: CategoryFieldErrors = createEmptyFieldErrorsCategory();
	public validationCategoryError: CategoryValidationErrors = {};
	public prefixMask = prefixMask;
	public isGetCategoryLoading = true;
	public isUpdateCategoryLoading = false;
	public categoryLoadError: HttpErrorBody | null = null;
	public showVisualIdentity = false;

	constructor(
		private readonly categoryService: CategoryService,
		private readonly route: ActivatedRoute
	) {}

	ngOnInit(): void {
		(this.route.parent ?? this.route).paramMap
			.pipe(
				switchMap((params) => {
					this.categoryContextVersion++;
					this.cancelCategoryUpdate$.next();
					this.id = params.get('id') ?? '';
					this.category = createEmptyCategory();
					this.validationCategoryError = {};
					this.fieldCategoryErrors = createEmptyFieldErrorsCategory();
					this.isUpdateCategoryLoading = false;
					this.isGetCategoryLoading = true;
					this.categoryLoadError = null;

					return this.categoryService.getCategory(this.id).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => (this.isGetCategoryLoading = false)),
						tap({
							next: (response: { data: CategoryInterface; message: string }) => {
								this.category = response.data;
							},
							error: (error: HttpErrorResponse) => {
								this.categoryLoadError = getHttpErrorBody(error);
							},
						}),
						catchError(() => EMPTY)
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe({ error: () => {} });
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.cancelCategoryUpdate$.complete();
	}

	updateCategory(): void {
		if (!this.id || this.category.id !== this.id || this.isGetCategoryLoading || this.categoryLoadError || this.isUpdateCategoryLoading) return;
		const categoryId = this.id;
		const contextVersion = this.categoryContextVersion;
		const isCurrentContext = () => contextVersion === this.categoryContextVersion && categoryId === this.id;
		this.validationCategoryError = {};
		this.fieldCategoryErrors = createEmptyFieldErrorsCategory();
		this.isUpdateCategoryLoading = true;

		this.categoryService
			.updateCategory(categoryId, { ...this.category })
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.cancelCategoryUpdate$),
				takeUntil(this.destroy$),
				finalize(() => {
					if (isCurrentContext()) this.isUpdateCategoryLoading = false;
				})
			)
			.subscribe({
				next: (response: { data: CategoryInterface; message: string }) => {
					if (!isCurrentContext()) return;
					this.validationCategoryError = {};
					this.category = response.data;
					toastr.success(response.message);
				},
				error: (errorResponse: HttpErrorResponse) => {
					if (!isCurrentContext()) return;
					const error = getHttpErrorBody(errorResponse);
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationCategoryError = error.validation;
						this.fieldCategoryErrors = buildShowErrors(this.fieldCategoryErrors, this.validationCategoryError);
						this.showVisualIdentity ||= !!this.validationCategoryError.icon;
					}
				},
			});
	}
}
