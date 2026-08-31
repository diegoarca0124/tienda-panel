import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '@app/services/category.service';
import { finalize, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../../common/pipes/safe-html.pipe';
import { closeModal } from '@app/common/utils/close-modal.util';
import { AlertComponent } from '@app/shared/alert/alert.component';
declare const toastr: any;
import { IMaskModule } from 'angular-imask';
import { createEmptyCategory, createEmptyFieldErrorsCategory, createEmptyFieldErrorsSubcategory, createEmptySubcategory } from '../utils/empties.util';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { showErrorsSubcategory } from '../constants/show-errors-subcategory.constant';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoOptions } from '../constants/monaco-options.constant';
import { InputSvgComponent } from '@app/shared/input-svg/input-svg.component';
import { PadCodePipe } from '../../../common/pipes/pad-code.pipe';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { CategoryFieldErrors, CategoryValidationErrors, SubcategoryFieldErrors, SubcategoryValidationErrors } from '../interfaces/validation.interface';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { CategoryInterface, SubcategoryInterface } from '../interfaces/data.interface';
import { prefixMask } from '../constants/prefix-mask.constant';
import { GetSubcategoriesRESI } from '../interfaces/response.interface';

@Component({
	selector: 'app-edit-category',
	imports: [
		TopbarComponent,
		SidebarComponent,
		FormsModule,
		CommonModule,
		RouterModule,
		NotFoundComponent,
		ModalDeleteComponent,
		SafeHtmlPipe,
		AlertComponent,
		TextareaAutoresizeDirective,
		IMaskModule,
		ValidationPopoverComponent,
		InputSvgComponent,
		PadCodePipe,
		NgbTooltipModule,
	],
	templateUrl: './edit-category.component.html',
	styleUrl: './edit-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EditCategoryComponent {
	@ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
	public isUpdatingMultipleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);

	private destroy$ = new Subject<void>();
	public isUpdateCategoryLoading = false;
	public isCreateSubcategoryLoading = false;

	public fieldCategoryErrors: CategoryFieldErrors = createEmptyFieldErrorsCategory();
	public fieldSubcategoryErrors: SubcategoryFieldErrors = createEmptyFieldErrorsSubcategory();

	public validationSubcategoryError: SubcategoryValidationErrors = {};
	public validationCategoryError: CategoryValidationErrors = {};

	public category: CategoryInterface = createEmptyCategory();
	public subcategory: SubcategoryInterface = createEmptySubcategory();

	public id: string = '';
	public isGetCategoryLoading = true;
	public isGetSubcategoriesLoading = true;

	public subcategories: SubcategoryInterface[] = [];

	public categoryLoadError: string = '';
	public subcategoryLoadError: string = '';

	public typeForm: 'create' | 'edit' = 'create';

	public option = 1;
	public selectedSubcategoriesIds = new Set<string>();
	public prefixMask = prefixMask;
	public editorOptions = MonacoOptions;

	constructor(
		private categoryService: CategoryService,
		private _router: Router,
		private _route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this._route.paramMap
			.pipe(
				takeUntil(this.destroy$),
				switchMap((params) => {
					this.id = params.get('id')!;
					const option = this._route.snapshot.queryParamMap.get('option');
					if (!option) {
						this.option = 1;

						this._router.navigate([], {
							relativeTo: this._route,
							queryParams: { option: 1 },
							queryParamsHandling: 'merge',
							replaceUrl: true,
						});
					} else {
						this.option = Number(option);
					}

					return this.initData(this.id);
				}),
				switchMap(() => this.initSubcategories$(this.id))
			)
			.subscribe({
				error: () => {},
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	setOption(value: number) {
		this.option = value;
		this._router.navigate([], {
			relativeTo: this._route,
			queryParams: { option: value },
			queryParamsHandling: 'merge',
		});
	}

	initData(id: string): Observable<any> {
		this.isGetCategoryLoading = true;
		this.categoryLoadError = '';

		return this.categoryService.getCategory(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.isGetCategoryLoading = false)),
			tap({
				next: (next: { data: CategoryInterface; message: string }) => {
					this.category = next.data;
					this.subcategory.categoryId = id;
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.categoryLoadError = error;
				},
			})
		);
	}

	initSubcategories$(id: string): Observable<{ data: SubcategoryInterface[]; message: string }> {
		this.isGetSubcategoriesLoading = true;
		this.subcategoryLoadError = '';
		return this.categoryService.getSubcategories(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.isGetSubcategoriesLoading = false)),
			tap({
				next: (next: { data: SubcategoryInterface[]; message: string }) => {
					this.subcategories = next.data.map((i) => ({
						...i,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(i.icon),
					}));
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.subcategoryLoadError = error;
				},
			})
		);
	}

	initSubcategories(id: string): void {
		this.initSubcategories$(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				error: () => {},
			});
	}

	private refreshSubcategories(id: string): void {
		this.categoryService
			.getSubcategories(id)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response: GetSubcategoriesRESI) => {
					this.subcategories = response.data.map((i) => ({
						...i,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(i.icon),
					}));
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error?.message || 'No fue posible actualizar la lista.');
				},
			});
	}

	updateCategory() {
		this.isUpdateCategoryLoading = true;
		this.categoryService
			.updateCategory(this.id, this.category)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.isUpdateCategoryLoading = false))
			)
			.subscribe({
				next: (next: { data: CategoryInterface; message: string }) => {
					this.validationCategoryError = {};
					this.category = next.data;
					toastr.success(next.message);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationCategoryError = error.validation;
						this.fieldCategoryErrors = buildShowErrors(this.fieldCategoryErrors, this.validationCategoryError);
					}
				},
			});
	}

	add() {
		if (this.typeForm == 'create') this.createSubcategory();
		else if (this.typeForm == 'edit') this.updateSubcategory();
	}

	createSubcategory() {
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
				next: (next: { data: SubcategoryInterface; message: string }) => {
					this.validationSubcategoryError = {};
					this.subcategory = createEmptySubcategory();
					next.data.safeIcon = this.sanitizer.bypassSecurityTrustHtml(next.data.icon);
					this.subcategories.push(next.data);
					toastr.success(next.message);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationSubcategoryError = error.validation;
						this.fieldSubcategoryErrors = buildShowErrors(this.fieldSubcategoryErrors, this.validationSubcategoryError);
					}
				},
			});
	}

	updateSubcategory() {
		this.isCreateSubcategoryLoading = true;
		this.categoryService
			.updateSubcategory(this.subcategory?.id, this.subcategory)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.isCreateSubcategoryLoading = false))
			)
			.subscribe({
				next: (next: { data: SubcategoryInterface; message: string }) => {
					this.validationSubcategoryError = {};

					const updatedSubcategory = {
						...next.data,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(next.data.icon || ''),
					};

					this.subcategories = this.subcategories.map((item) => (item.id === updatedSubcategory.id ? updatedSubcategory : item));

					toastr.success(next.message);
					this.cancelEdit();
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationSubcategoryError = error.validation;
						this.fieldSubcategoryErrors = buildShowErrors(this.fieldSubcategoryErrors, this.validationSubcategoryError);
					}
				},
			});
	}

	onUpdateStatus(id: string, status: boolean) {
		this.isUpdatingSingleStatus.set(true);
		this.categoryService
			.updateSubcategoryStatus(id, { status: !status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingSingleStatus.set(false))
			)
			.subscribe({
				next: (next: { data: SubcategoryInterface; message: string }) => {
					toastr.success(next.message);
					closeModal(`modalDelete-${id}`);
					this.refreshSubcategories(this.id);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error?.message || 'No fue posible actualizar el estado.');
				},
			});
	}

	cancelEdit() {
		this.subcategory = {
			name: '',
			icon: '',
			prefix: '',
			categoryId: this.id,
		};
		this.validationSubcategoryError = {};
		this.typeForm = 'create';
	}

	editSubcategory(subcategory: SubcategoryInterface) {
		this.validationSubcategoryError = {};
		this.typeForm = 'edit';

		this.subcategory = { ...subcategory };
	}

	toggleItem(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;

		if (checked) {
			this.selectedSubcategoriesIds.add(id);
		} else {
			this.selectedSubcategoriesIds.delete(id);
		}
	}

	getSelectedIds(): string[] {
		return [...this.selectedSubcategoriesIds];
	}

	onUpdateStatusMultiple(status: boolean) {
		this.isUpdatingMultipleStatus.set(true);
		this.categoryService
			.updateSubcategoriesStatus({
				ids: this.getSelectedIds(),
				status,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingMultipleStatus.set(false))
			)
			.subscribe({
				next: (next: { data: string[]; message: string }) => {
					toastr.success(next.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedSubcategoriesIds.clear();
					this.refreshSubcategories(this.id);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error?.message || 'No fue posible actualizar el estado.');
				},
			});
	}
}
