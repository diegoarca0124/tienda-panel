import { getHttpErrorBody, type HttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
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
import { catchError, EMPTY, finalize, map, merge, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { PadCodePipe } from '../../../../../common/pipes/pad-code.pipe';
import { prefixMask } from '../../../constants/prefix-mask.constant';
import { CategoryInterface, SubcategoryInterface } from '../../../interfaces/data.interface';
import { GetSubcategoriesRESI } from '../../../interfaces/response.interface';
import { SubcategoryFieldErrors, SubcategoryValidationErrors } from '../../../interfaces/validation.interface';
import { createEmptyCategory, createEmptyFieldErrorsSubcategory, createEmptySubcategory } from '../../../utils/empties.util';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';

declare const toastr: any;

@Component({
	selector: 'app-index-subcategory-settings-category',
	imports: [CommonModule, FormsModule, IMaskModule, NgbTooltipModule, NotFoundComponent, ModalDeleteComponent, ValidationPopoverComponent, InputSvgComponent, PadCodePipe],
	templateUrl: './index-subcategory-settings-category.component.html',
	styleUrl: './index-subcategory-settings-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IndexSubcategorySettingsCategoryComponent {
	private readonly destroy$ = new Subject<void>();
	private readonly subcategoriesLoadCancel$ = new Subject<void>();
	private readonly categoryRetry$ = new Subject<void>();
	@ViewChild('editSubcategoryModal', { static: true }) private editModal!: ElementRef<HTMLDivElement>;
	private readonly preventCloseWhileSaving = (event: Event): void => {
		if (this.isCreateSubcategoryLoading) event.preventDefault();
	};
	private readonly resetEdit = (): void => {
		this.subcategory = createEmptySubcategory();
		this.subcategory.categoryId = this.id;
		this.validationSubcategoryError = {};
		this.fieldSubcategoryErrors = createEmptyFieldErrorsSubcategory();
	};

	public id = '';
	public filter = '';
	private appliedFilter = '';
	public category: CategoryInterface = createEmptyCategory();
	public subcategory: SubcategoryInterface = createEmptySubcategory();
	public subcategories: SubcategoryInterface[] = [];
	public fieldSubcategoryErrors: SubcategoryFieldErrors = createEmptyFieldErrorsSubcategory();
	public validationSubcategoryError: SubcategoryValidationErrors = {};
	public selectedSubcategoriesIds = new Set<string>();
	public readonly maxSelectedSubcategories = 20;
	public prefixMask = prefixMask;
	public isGetCategoryLoading = true;
	public isGetSubcategoriesLoading = true;
	public isCreateSubcategoryLoading = false;
	public categoryLoadError: HttpErrorBody | null = null;
	public subcategoriesLoadError: HttpErrorBody | null = null;
	public isUpdatingMultipleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);

	constructor(
		private readonly categoryService: CategoryService,
		private readonly route: ActivatedRoute,
		private readonly sanitizer: DomSanitizer
	) {}

	ngOnInit(): void {
		merge(
			(this.route.parent ?? this.route).paramMap.pipe(map((params) => params.get('id') ?? '')),
			this.categoryRetry$.pipe(map(() => this.id))
		)
			.pipe(
				switchMap((id) => {
					this.subcategoriesLoadCancel$.next();
					this.clearSubcategoriesTable();
					this.id = id;
					this.subcategory.categoryId = this.id;
					this.category = createEmptyCategory();
					this.isGetCategoryLoading = true;
					this.isGetSubcategoriesLoading = false;
					this.categoryLoadError = null;
					this.subcategoriesLoadError = null;

					return this.categoryService.getCategory(this.id).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => (this.isGetCategoryLoading = false)),
						tap({
							next: (response: { data: CategoryInterface; message: string }) => {
								this.category = response.data;
							},
							error: (error: HttpErrorResponse) => {
								this.clearSubcategoriesTable();
								this.categoryLoadError = getHttpErrorBody(error);
								this.isGetSubcategoriesLoading = false;
							},
						}),
						switchMap(() => this.initSubcategories$(this.id)),
						catchError(() => EMPTY)
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe({ error: () => {} });
	}

	ngAfterViewInit(): void {
		this.editModal.nativeElement.addEventListener('hide.bs.modal', this.preventCloseWhileSaving);
		this.editModal.nativeElement.addEventListener('hidden.bs.modal', this.resetEdit);
	}

	ngOnDestroy(): void {
		this.editModal.nativeElement.removeEventListener('hide.bs.modal', this.preventCloseWhileSaving);
		this.editModal.nativeElement.removeEventListener('hidden.bs.modal', this.resetEdit);
		if (this.editModal.nativeElement.classList.contains('show')) closeModal('modalEditSubcategory');
		this.destroy$.next();
		this.destroy$.complete();
		this.subcategoriesLoadCancel$.complete();
		this.categoryRetry$.complete();
	}

	initSubcategories$(id: string): Observable<GetSubcategoriesRESI> {
		this.subcategoriesLoadCancel$.next();
		this.clearSubcategoriesTable();
		this.isGetSubcategoriesLoading = true;
		this.subcategoriesLoadError = null;

		return this.categoryService.getSubcategories(id, this.appliedFilter).pipe(
			takeUntil(this.subcategoriesLoadCancel$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.isGetSubcategoriesLoading = false)),
			tap({
				next: (response: GetSubcategoriesRESI) => {
					this.setSubcategories(response.data);
				},
				error: (error: HttpErrorResponse) => {
					this.clearSubcategoriesTable();
					this.subcategoriesLoadError = getHttpErrorBody(error);
				},
			}),
			catchError(() => EMPTY)
		);
	}

	initSubcategories(id: string): void {
		this.initSubcategories$(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({ error: () => {} });
	}

	applyFilter(): void {
		if (this.isGetCategoryLoading || this.isGetSubcategoriesLoading || this.categoryLoadError) return;
		this.filter = this.filter.trim().slice(0, 150);
		this.appliedFilter = this.filter;
		this.selectedSubcategoriesIds.clear();
		this.initSubcategories(this.id);
	}

	resetFilter(): void {
		if (this.isGetCategoryLoading || this.isGetSubcategoriesLoading || this.categoryLoadError) return;
		this.filter = '';
		this.applyFilter();
	}

	retryLoad(): void {
		if (!this.id || this.isGetCategoryLoading || this.isGetSubcategoriesLoading) return;
		if (this.categoryLoadError) {
			this.categoryRetry$.next();
		} else {
			this.initSubcategories(this.id);
		}
	}

	private refreshSubcategories(): void {
		this.initSubcategories(this.id);
	}

	private clearSubcategoriesTable(): void {
		this.subcategories = [];
		this.selectedSubcategoriesIds.clear();
	}

	get canUpdateSelectedSubcategories(): boolean {
		return !this.isGetCategoryLoading && !this.isGetSubcategoriesLoading && !this.categoryLoadError && !this.subcategoriesLoadError
			&& !this.isUpdatingMultipleStatus() && !this.isUpdatingSingleStatus()
			&& this.selectedSubcategoriesIds.size > 0
			&& this.selectedSubcategoriesIds.size <= this.maxSelectedSubcategories
			&& [...this.selectedSubcategoriesIds].every((id) => this.subcategories.some((subcategory) => subcategory.id === id));
	}

	private setSubcategories(subcategories: SubcategoryInterface[]): void {
		this.selectedSubcategoriesIds.clear();
		this.subcategories = subcategories.map((subcategory) => ({
			...subcategory,
			safeIcon: this.sanitizer.bypassSecurityTrustHtml(subcategory.icon),
		}));
	}

	updateSubcategory(): void {
		if (!this.subcategory.id || this.isCreateSubcategoryLoading || this.isGetSubcategoriesLoading || this.categoryLoadError || this.subcategoriesLoadError) return;
		this.validationSubcategoryError = {};
		this.fieldSubcategoryErrors = createEmptyFieldErrorsSubcategory();
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
					this.validationSubcategoryError = {};
					toastr.success(response.message);
					this.isCreateSubcategoryLoading = false;
					this.cancelEdit();
					this.refreshSubcategories();
				},
				error: (errorResponse: HttpErrorResponse) => this.handleValidationError(errorResponse),
			});
	}

	private handleValidationError(errorResponse: HttpErrorResponse): void {
		const error = getHttpErrorBody(errorResponse);
		toastr.error(error.message || '¡Error desconocido!');

		if (error.validation) {
			this.validationSubcategoryError = error.validation;
			this.fieldSubcategoryErrors = buildShowErrors(this.fieldSubcategoryErrors, this.validationSubcategoryError);
		}
	}

	cancelEdit(): void {
		if (this.isCreateSubcategoryLoading) return;
		(window as any).bootstrap.Modal.getInstance(this.editModal.nativeElement)?.hide();
	}

	editSubcategory(subcategory: SubcategoryInterface): void {
		if (this.isCreateSubcategoryLoading) return;
		this.validationSubcategoryError = {};
		this.fieldSubcategoryErrors = createEmptyFieldErrorsSubcategory();
		this.subcategory = { ...subcategory };
		(window as any).bootstrap.Modal.getOrCreateInstance(this.editModal.nativeElement).show();
	}

	toggleItem(id: string, event: Event): void {
		if (!id || this.isGetCategoryLoading || this.isGetSubcategoriesLoading || this.categoryLoadError || this.subcategoriesLoadError) return;
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			if (!this.selectedSubcategoriesIds.has(id) && this.selectedSubcategoriesIds.size >= this.maxSelectedSubcategories) return;
			this.selectedSubcategoriesIds.add(id);
		} else {
			this.selectedSubcategoriesIds.delete(id);
		}
	}

	getSelectedIds(): string[] {
		return [...this.selectedSubcategoriesIds];
	}

	selectAllSubcategories(): void {
		if (this.isGetCategoryLoading || this.isGetSubcategoriesLoading || this.categoryLoadError || this.subcategoriesLoadError) return;
		const ids = [...new Set(this.subcategories.map((subcategory) => subcategory.id).filter((id): id is string => Boolean(id)))];
		for (const id of ids) {
			if (this.selectedSubcategoriesIds.size >= this.maxSelectedSubcategories) break;
			this.selectedSubcategoriesIds.add(id);
		}
		if (ids.some((id) => !this.selectedSubcategoriesIds.has(id))) {
			toastr.info(`Puedes seleccionar un máximo de ${this.maxSelectedSubcategories} registros.`);
		}
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
				error: (error: HttpErrorResponse) => toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message),
			});
	}

	onUpdateStatusMultiple(status: boolean): void {
		if (!this.canUpdateSelectedSubcategories) return;
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
				error: (error: HttpErrorResponse) => toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message),
			});
	}
}
