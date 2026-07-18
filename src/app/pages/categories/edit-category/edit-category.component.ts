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
import { createEmptyCategory, createEmptySubcategory } from '../utils/empties.util';
import { CategoryInterface } from '../interfaces/category.interface';
import { SubcategoryInterface } from '../interfaces/subcategory.interface';
import { showErrorsCategory } from '../constants/show-errors-category.constant';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { showErrorsSubcategory } from '../constants/show-errors-subcategory.constant';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MonacoOptions } from '../constants/monaco-options.constant';
import { InputSvgComponent } from '@app/shared/input-svg/input-svg.component';
import { PadCodePipe } from "../../../common/pipes/pad-code.pipe";
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'app-edit-category',
	imports: [TopbarComponent, SidebarComponent, FormsModule, CommonModule, RouterModule, NotFoundComponent, ModalDeleteComponent, SafeHtmlPipe, AlertComponent, TextareaAutoresizeDirective, IMaskModule, ValidationPopoverComponent, InputSvgComponent, PadCodePipe, NgbTooltipModule],
	templateUrl: './edit-category.component.html',
	styleUrl: './edit-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditCategoryComponent {
	@ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
	public loadBtnMultipleStatus: WritableSignal<boolean> = signal(false);
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public loadBtnSubcat = false;
	public errorsCategory: any = {};
	public errorsSubcategory: any = {};
	public category: CategoryInterface = createEmptyCategory();
	public subcategory: SubcategoryInterface = createEmptySubcategory();
	public id: string = '';
	public loading = true;
	public loadingSubcategories = true;
	public subcategories: SubcategoryInterface[] = [];
	public msmErrorUpdateCategory : any= [];
	public msmErrorCreateSubcategory : any= [];
	public msmErrorUpdateSubcategory : any= [];
	public errorMsmServerGetCategory: string = '';
	public errorMsmServerGetSubcategory: string = '';
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public typeForm: 'create' | 'edit' = 'create';
	public option = 1;
	public selectedIds = new Set<string>();
	public columns = [
		{ key: 'name', label: 'Subcategoría', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-200 col-w-md-250' },
	];
	public prefixMask = {
		mask: /^[A-Z]{0,3}$/,
		prepare: (str: string) => str.toUpperCase()
	};
	public showErrorsCategory = showErrorsCategory;
	public showErrorsSubcategory = showErrorsSubcategory;
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
        	error: () => {
			
			}
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
		this.loading = true;
		this.errorMsmServerGetCategory = '';

		return this.categoryService.get_category(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loading = false)),
			tap({
				next: (next: {data: CategoryInterface, message: string}) => {
					this.category = next.data;
					this.subcategory.categoryId = id;
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.errorMsmServerGetCategory = error;
				},
			})
		);
	}

	initSubcategories$(id: string): Observable<{ data: SubcategoryInterface[], message: string}> {
		this.loadingSubcategories = true;
		this.errorMsmServerGetSubcategory = '';
		return this.categoryService.get_subcategories(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadingSubcategories = false)),
			tap({
				next: (next: { data: SubcategoryInterface[], message: string}) => {
					this.subcategories = next.data.map((i) => ({
						...i,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(i.icon),
					}));
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.errorMsmServerGetSubcategory = error;
				},
			})
		);
	}

	initSubcategories(id: string){
		this.initSubcategories$(id)
		.pipe(takeUntil(this.destroy$))
		.subscribe();
	}

	update() {
		this.loadBtn = true;
		this.errorsCategory = {};
		this.msmErrorUpdateCategory = [];
		this.categoryService
			.update_category(this.id, this.category)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: {data: CategoryInterface, message:string}) => {
					this.errorsCategory = {};
					this.category = next.data
					toastr.success(next.message);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.errorsCategory = error.validation;
						this.msmErrorUpdateCategory = Object.values(this.errorsCategory).flat();
						for (const key in this.showErrorsCategory) {
							this.showErrorsCategory[key as keyof typeof this.showErrorsCategory] =
							!!this.errorsCategory?.[key]?.length;
						}	
					}
				},
			});
	}

	add() {
		if (this.typeForm == 'create') this.create_subcategory();
		else if (this.typeForm == 'edit') this.update_subcategory();
	}

	create_subcategory() {
		this.loadBtnSubcat = true;
		this.msmErrorCreateSubcategory = [];
		this.subcategory.categoryId = this.id;
		this.categoryService
			.create_subcategory(this.subcategory)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtnSubcat = false))
			)
			.subscribe({
				next: (next: {data: SubcategoryInterface, message: string}) => {		
					this.errorsSubcategory = {};
					this.subcategory = createEmptySubcategory();
					next.data.safeIcon = this.sanitizer.bypassSecurityTrustHtml(next.data.icon);
					this.subcategories.push(next.data);
					toastr.success(next.message);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.errorsSubcategory = error.validation;
						this.msmErrorCreateSubcategory = Object.values(this.errorsSubcategory).flat();
						for (const key in this.showErrorsSubcategory) {
							this.showErrorsSubcategory[key as keyof typeof this.showErrorsSubcategory] =
							!!this.errorsSubcategory?.[key]?.length;
						}	
					}

				},
			});
	}

	update_subcategory() {
		this.loadBtnSubcat = true;
		this.msmErrorUpdateSubcategory = [];
		this.errorsSubcategory = {};
		this.categoryService
			.update_subcategory(this.subcategory?.id, this.subcategory)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtnSubcat = false))
			)
			.subscribe({
				next: (next: {data: SubcategoryInterface, message:string}) => {
					this.subcategories = this.subcategories.map((subcat: any) => (subcat.id === this.subcategory.id ? next.data : subcat));
					toastr.success(next.message);
					this.cancelEdit();
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.errorsSubcategory = error.validation;
						this.msmErrorUpdateSubcategory = Object.values(this.errorsSubcategory).flat();
					}
				},
			});
	}

	setStatus(id: string, status: boolean) {
		this.loadBtnDelete.set(true);
		this.categoryService
			.update_status_subcategory(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: {data: SubcategoryInterface, message: string}) => {
					this.subcategories = this.subcategories.map((prev: SubcategoryInterface) => {
						if (next.data.id === prev.id) {
							return { ...prev, status: next.data.status };
						}
						return prev;
					});
					toastr.success(next.message);
					closeModal(id);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error.message);
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
		this.errorsSubcategory = {};
		this.typeForm = 'create';
	}

	editSubcategory(subcategory: SubcategoryInterface) {
		this.errorsSubcategory = {};
		this.msmErrorUpdateSubcategory = [];
		this.typeForm = 'edit';

		this.subcategory = { ...subcategory };
	}

	toggleItem(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;

		if (checked) {
			this.selectedIds.add(id);
		} else {
			this.selectedIds.delete(id);
		}
	}

	getSelectedIds(): string[] {
		return [...this.selectedIds];
	}

	onUpdateStatusMultiple(status: boolean){
		this.loadBtnMultipleStatus.set(true);
		this.categoryService
		.update_status_subcategories({
			ids: this.getSelectedIds(),
			status
		})
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => this.loadBtnMultipleStatus.set(false))
		)
		.subscribe({
			next: (next: {data: string[], message:string}) => {
				this.subcategories = this.subcategories.map((prev: SubcategoryInterface) => {
					if (next.data.includes(prev.id)) {
						return { ...prev, status: status };
					}
					return prev;
				});

				toastr.success(next.message);
				closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
				this.selectedIds.clear();
			},
			error: (error: HttpErrorResponse) => {
				toastr.error(error.error.message);
			},
		});
	}
}
