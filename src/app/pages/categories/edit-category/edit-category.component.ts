import { Component, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Category } from '@app/common/interface/category.interface';
import { CategoryService } from '@app/services/category.service';
import { finalize, Observable, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { html } from '@codemirror/lang-html';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { Subcategory } from '@app/common/interface/subcategory.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeHtmlPipe } from '../../../common/pipes/safe-html.pipe';
import { closeModal } from '@app/common/utils/close-modal.util';
import { AlertComponent } from '@app/shared/alert/alert.component';
declare const toastr: any;
declare const $: any;
import { TextFieldModule } from '@angular/cdk/text-field';

@Component({
	selector: 'app-edit-category',
	imports: [TopbarComponent, SidebarComponent, FormsModule, CommonModule, RouterModule, NotFoundComponent, ModalDeleteComponent, SafeHtmlPipe, AlertComponent, TextFieldModule],
	templateUrl: './edit-category.component.html',
	styleUrl: './edit-category.component.css',
})
export class EditCategoryComponent {
	@ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
	public loadBtnMultipleStatus: WritableSignal<boolean> = signal(false);
	editorView!: EditorView;
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public loadBtnSubcat = false;
	public errorsCategory: any = {};
	public errorsSubcategory: any = {};
	public category: Category = {
		name: '',
		slug: '',
		icon: '',
		description: '',
		isDimensions: false,
		isCharacteristics: false,
		isConditiom: false,
		isWarranty: false,
		isCountryOfOrigin: false,
		isMaterial: false,
		isTemperature: false,	
	};
	public subcategory: Subcategory = {
		name: '',
		icon: '',
		categoryId: '',
	};
	public id: string = '';
	public loading = true;
	public loadingSubcategories = true;
	public subcategories: any = [];
	public msmErrorUpdateCategory : any= [];
	public msmErrorCreateSubcategory : any= [];
	public msmErrorUpdateSubcategory : any= [];
	public errorMsmServerGetCategory: string = '';
	public errorMsmServerGetSubcategory: string = '';
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public typeForm: 'create' | 'edit' = 'create';
	public errorMsmServer: string = '';
	public option = 1;
	public selectedIds = new Set<string>();
	public columns = [
		{ key: 'name', label: 'Subcategoría', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-200 col-w-md-250' },
	];

	constructor(
		private categoryService: CategoryService,
		private _router: Router,
		private _route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this._route.params
			.pipe(
				takeUntil(this.destroy$),
				switchMap((params) => {
					this.id = params['id'];
					return this.init_data(this.id); // devolvemos el observable
				}),
				switchMap(() => this.init_subcategories(this.id))
			)
			.subscribe({
				next: (subcategories) => {
					console.log('Subcategorías cargadas:', subcategories);
				},
				error: (err) => {
					console.error(err);
				},
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	setOption(value: number) {
		this.option = value;
	}

	init_data(id: string): Observable<Category> {
		this.loading = true;
		this.errorMsmServerGetCategory = '';

		return this.categoryService.get_category(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loading = false)),
			tap({
				next: (next) => {
					this.category = next;
					this.subcategory.categoryId = id;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerGetCategory = error;
				},
			})
		);
	}

	init_subcategories(id: string): Observable<Subcategory[]> {
		this.loadingSubcategories = true;
		this.errorMsmServerGetSubcategory = '';
		return this.categoryService.get_subcategories(id).pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadingSubcategories = false)),
			tap({
				next: (next) => {
					this.subcategories = next;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerGetSubcategory = error;
				},
			})
		);
	}

	update() {
		this.loadBtn = true;
		this.errorsCategory = {};
		this.errorMsmServer = '';
		this.msmErrorUpdateCategory = [];
		this.categoryService
			.update_category(this.id, this.category)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: Category) => {
					this.errorsCategory = {};
					this.category = next;
					toastr.success('Categoría actualizada correctamente.');
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (error.validation) {
						this.errorsCategory = error.validation;
						this.msmErrorUpdateCategory = Object.values(this.errorsCategory).flat();
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
		this.errorMsmServer = '';
		this.msmErrorCreateSubcategory = [];
		this.errorsSubcategory = {};
		this.categoryService
			.create_subcategory(this.subcategory)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtnSubcat = false))
			)
			.subscribe({
				next: (next: Subcategory) => {
					this.subcategory = {
						name: '',
						icon: '',
						categoryId: this.id,
					};
					this.subcategories.push(next);
					toastr.success('Subcategoría creada correctamente.');
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (error.validation) {
						this.errorsSubcategory = error.validation;
						this.msmErrorCreateSubcategory = Object.values(this.errorsSubcategory).flat();
						this.errorMsmServer = '';
					}
				},
			});
	}

	update_subcategory() {
		this.loadBtnSubcat = true;
		this.msmErrorUpdateSubcategory = [];
		this.errorMsmServer = '';
		this.errorsSubcategory = {};
		this.categoryService
			.update_subcategory(this.subcategory?.id, this.subcategory)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtnSubcat = false))
			)
			.subscribe({
				next: (next) => {
					this.subcategories = this.subcategories.map((subcat: any) => (subcat.id === this.subcategory.id ? next : subcat));
					toastr.success('Subcategoría actualizado correctamente.');
					this.cancelEdit();
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

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
				next: (next: Subcategory) => {
					this.subcategories = this.subcategories.map((prev: Subcategory) => {
						if (next.id === prev.id) {
							return { ...prev, status: next.status };
						}
						return prev;
					});
					toastr.success('Se actualizó el estado correctamente.');
					closeModal(id);
				},
				error: (error: any) => {
					toastr.error(error.error.message);
				},
			});
	}

	cancelEdit() {
		this.subcategory = {
			name: '',
			icon: '',
			categoryId: this.id,
		};
		this.errorsSubcategory = {};
		this.typeForm = 'create';
	}

	editSubcategory(subcategory: Subcategory) {
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
			next: (next: any) => {
				console.log(next);
				
				this.subcategories = this.subcategories.map((prev: Subcategory) => {
					if (next.includes(prev.id)) {
						return { ...prev, status: status };
					}
					return prev;
				});

				toastr.success('Se actualizó el estado correctamente.');
				closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
				this.selectedIds.clear();
			},
			error: (error: any) => {
				toastr.error(error.error.message);
			},
		});
	}
}
