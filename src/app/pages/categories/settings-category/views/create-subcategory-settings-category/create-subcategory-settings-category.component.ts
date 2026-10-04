import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { InputSvgComponent } from '@app/shared/input-svg/input-svg.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { IMaskModule } from 'angular-imask';
import { finalize, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { prefixMask } from '../../../constants/prefix-mask.constant';
import { CategoryInterface, SubcategoryInterface } from '../../../interfaces/data.interface';
import { SubcategoryFieldErrors, SubcategoryValidationErrors } from '../../../interfaces/validation.interface';
import { createEmptyCategory, createEmptyFieldErrorsSubcategory, createEmptySubcategory } from '../../../utils/empties.util';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';

declare const toastr: any;

@Component({
	selector: 'app-create-subcategory-settings-category',
	imports: [CommonModule, FormsModule, IMaskModule, NotFoundComponent, ValidationPopoverComponent, InputSvgComponent],
	templateUrl: './create-subcategory-settings-category.component.html',
	styleUrl: './create-subcategory-settings-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateSubcategorySettingsCategoryComponent {
	private readonly destroy$ = new Subject<void>();

	public id = '';
	public category: CategoryInterface = createEmptyCategory();
	public subcategory: SubcategoryInterface = createEmptySubcategory();
	public fieldSubcategoryErrors: SubcategoryFieldErrors = createEmptyFieldErrorsSubcategory();
	public validationSubcategoryError: SubcategoryValidationErrors = {};
	public prefixMask = prefixMask;
	public isGetCategoryLoading = true;
	public isCreateSubcategoryLoading = false;
	public categoryLoadError = '';

	constructor(
		private readonly categoryService: CategoryService,
		private readonly route: ActivatedRoute
	) {}

	ngOnInit(): void {
		(this.route.parent ?? this.route).paramMap
			.pipe(
				takeUntil(this.destroy$),
				switchMap((params) => {
					this.id = params.get('id') ?? '';
					this.subcategory.categoryId = this.id;
					this.isGetCategoryLoading = true;
					this.categoryLoadError = '';

					return this.categoryService.getCategory(this.id).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => (this.isGetCategoryLoading = false)),
						tap({
							next: (response: { data: CategoryInterface; message: string }) => {
								this.category = response.data;
							},
							error: (error: HttpErrorResponse) => {
								this.categoryLoadError = error.error;
							},
						})
					);
				})
			)
			.subscribe({ error: () => {} });
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	createSubcategory(): void {
		this.isCreateSubcategoryLoading = true;
		this.subcategory.categoryId = this.id;

		this.categoryService
			.createSubcategory(this.subcategory)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isCreateSubcategoryLoading = false))
			)
			.subscribe({
				next: (response: { data: SubcategoryInterface; message: string }) => {
					this.validationSubcategoryError = {};
					this.fieldSubcategoryErrors = createEmptyFieldErrorsSubcategory();
					this.subcategory = createEmptySubcategory();
					this.subcategory.categoryId = this.id;
					toastr.success(response.message);
				},
				error: (errorResponse: HttpErrorResponse) => {
					const error = errorResponse.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationSubcategoryError = error.validation;
						this.fieldSubcategoryErrors = buildShowErrors(this.fieldSubcategoryErrors, this.validationSubcategoryError);
					}
				},
			});
	}
}
