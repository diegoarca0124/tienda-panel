import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { InputSvgComponent } from '@app/shared/input-svg/input-svg.component';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { DomSanitizer } from '@angular/platform-browser';
import { IMaskModule } from 'angular-imask';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PadCodePipe } from '../../../../../common/pipes/pad-code.pipe';
import { prefixMask } from '../../../constants/prefix-mask.constant';
import { CategoryInterface, SubcategoryInterface } from '../../../interfaces/data.interface';
import { GetSubcategoriesRESI } from '../../../interfaces/response.interface';
import { SubcategoryFieldErrors, SubcategoryValidationErrors } from '../../../interfaces/validation.interface';
import { createEmptyCategory, createEmptyFieldErrorsSubcategory, createEmptySubcategory } from '../../../utils/empties.util';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';

declare const toastr: any;

@Component({
	selector: 'app-index-subcategory',
	imports: [CommonModule, FormsModule, IMaskModule, NgbTooltipModule, NotFoundComponent, ModalDeleteComponent, ValidationPopoverComponent, InputSvgComponent, PadCodePipe],
	templateUrl: './index-subcategory.component.html',
	styleUrl: './index-subcategory.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IndexSubcategoryComponent {
	private readonly destroy$ = new Subject<void>();

	public id = '';
	public category: CategoryInterface = createEmptyCategory();
	public subcategory: SubcategoryInterface = createEmptySubcategory();
	public subcategories: SubcategoryInterface[] = [];
	public fieldSubcategoryErrors: SubcategoryFieldErrors = createEmptyFieldErrorsSubcategory();
	public validationSubcategoryError: SubcategoryValidationErrors = {};
	public selectedSubcategoriesIds = new Set<string>();
	public prefixMask = prefixMask;
	public typeForm: 'create' | 'edit' = 'create';
	public isGetCategoryLoading = true;
	public isGetSubcategoriesLoading = true;
	public isCreateSubcategoryLoading = false;
	public categoryLoadError = '';
	public subcategoryLoadError = '';
	public isUpdatingMultipleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);

	constructor(
		private readonly categoryService: CategoryService,
		private readonly route: ActivatedRoute,
		private readonly sanitizer: DomSanitizer
	) {}

	ngOnInit(): void {
		this.route.paramMap
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
				}),
				switchMap(() => this.initSubcategories$(this.id))
			)
			.subscribe({ error: () => {} });
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	initSubcategories$(id: string): Observable<GetSubcategoriesRESI> {
		this.isGetSubcategoriesLoading = true;
		this.subcategoryLoadError = '';

		return this.categoryService.getSubcategories(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.isGetSubcategoriesLoading = false)),
			tap({
				next: (response: GetSubcategoriesRESI) => {
					this.setSubcategories(response.data);
				},
				error: (error: HttpErrorResponse) => {
					this.subcategoryLoadError = error.error;
				},
			})
		);
	}

	initSubcategories(id: string): void {
		this.initSubcategories$(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({ error: () => {} });
	}

	private refreshSubcategories(): void {
		this.categoryService
			.getSubcategories(this.id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response: GetSubcategoriesRESI) => this.setSubcategories(response.data),
				error: (error: HttpErrorResponse) => toastr.error(error.error?.message || 'No fue posible actualizar la lista.'),
			});
	}

	private setSubcategories(subcategories: SubcategoryInterface[]): void {
		this.subcategories = subcategories.map((subcategory) => ({
			...subcategory,
			safeIcon: this.sanitizer.bypassSecurityTrustHtml(subcategory.icon),
		}));
	}

	updateSubcategory(): void {
		this.isCreateSubcategoryLoading = true;

		this.categoryService
			.updateSubcategory(this.subcategory.id, this.subcategory)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isCreateSubcategoryLoading = false))
			)
			.subscribe({
				next: (response: { data: SubcategoryInterface; message: string }) => {
					const updated = {
						...response.data,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(response.data.icon || ''),
					};

					this.validationSubcategoryError = {};
					this.subcategories = this.subcategories.map((item) => (item.id === updated.id ? updated : item));
					toastr.success(response.message);
					this.cancelEdit();
				},
				error: (errorResponse: HttpErrorResponse) => this.handleValidationError(errorResponse),
			});
	}

	private handleValidationError(errorResponse: HttpErrorResponse): void {
		const error = errorResponse.error;
		toastr.error(error.message || '¡Error desconocido!');

		if (error.validation) {
			this.validationSubcategoryError = error.validation;
			this.fieldSubcategoryErrors = buildShowErrors(this.fieldSubcategoryErrors, this.validationSubcategoryError);
		}
	}

	cancelEdit(): void {
		this.subcategory = createEmptySubcategory();
		this.subcategory.categoryId = this.id;
		this.validationSubcategoryError = {};
		this.typeForm = 'create';
	}

	editSubcategory(subcategory: SubcategoryInterface): void {
		this.validationSubcategoryError = {};
		this.typeForm = 'edit';
		this.subcategory = { ...subcategory };
	}

	toggleItem(id: string, event: Event): void {
		const checked = (event.target as HTMLInputElement).checked;
		checked ? this.selectedSubcategoriesIds.add(id) : this.selectedSubcategoriesIds.delete(id);
	}

	getSelectedIds(): string[] {
		return [...this.selectedSubcategoriesIds];
	}

	selectAllSubcategories(): void {
		this.selectedSubcategoriesIds = new Set(this.subcategories.map((subcategory) => subcategory.id).filter((id): id is string => Boolean(id)));
	}

	clearSubcategorySelection(): void {
		this.selectedSubcategoriesIds.clear();
	}

	get areAllSubcategoriesSelected(): boolean {
		return this.subcategories.length > 0 && this.subcategories.every((subcategory) => Boolean(subcategory.id) && this.selectedSubcategoriesIds.has(subcategory.id!));
	}

	onUpdateStatus(id: string, status: boolean): void {
		this.isUpdatingSingleStatus.set(true);

		this.categoryService
			.updateSubcategoryStatus(id, { status: !status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingSingleStatus.set(false))
			)
			.subscribe({
				next: (response: { data: SubcategoryInterface; message: string }) => {
					toastr.success(response.message);
					closeModal(`modalDelete-${id}`);
					this.refreshSubcategories();
				},
				error: (error: HttpErrorResponse) => toastr.error(error.error?.message || 'No fue posible actualizar el estado.'),
			});
	}

	onUpdateStatusMultiple(status: boolean): void {
		this.isUpdatingMultipleStatus.set(true);

		this.categoryService
			.updateSubcategoriesStatus({ ids: this.getSelectedIds(), status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingMultipleStatus.set(false))
			)
			.subscribe({
				next: (response: { data: string[]; message: string }) => {
					toastr.success(response.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedSubcategoriesIds.clear();
					this.refreshSubcategories();
				},
				error: (error: HttpErrorResponse) => toastr.error(error.error?.message || 'No fue posible actualizar el estado.'),
			});
	}
}
