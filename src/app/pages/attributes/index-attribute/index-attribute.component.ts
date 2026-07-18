import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
import { statusTable } from '@app/common/constants/statusTable.contant';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { sortColumnsTable } from '@app/common/utils/sort-columns-table.util';
import { AttributeService } from '@app/services/attribute.service';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { MenuSelectCategoriesComponent } from '@app/shared/menu-select-categories/menu-select-categories.component';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { combineLatest, filter, finalize, forkJoin, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AttributeInterface } from '../interfaces/attribute.interface';
import { sortColumnsAttributes } from '../constants/sortColumnsAttributes.constant';
import { ValidateQPAttributes } from '../utils/validate-qp-attribute.util';
import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { createEmptyGroupAttribute } from '../utils/empties.util';
import { CategoryInterface } from '@app/pages/categories/interfaces/category.interface';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-index-attribute',
	imports: [
		TopbarComponent,
		SidebarComponent,
		CommonModule,
		RouterModule,
		FormsModule,
		PaginationComponent,
		NotFoundComponent,
		ModalDeleteComponent,
		NgSelectModule,
		MenuSelectCategoriesComponent
	],
	templateUrl: './index-attribute.component.html',
	styleUrl: './index-attribute.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IndexAttributeComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public loadBtnMultipleStatus: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public currentPage: number = 1;
	public limit: number = 10;
	public sort: string = 'Predeterminado';
	public totalPages: number = 0;
	public loading: boolean = true;
	public loadAttributeGroup : boolean = true;
	public groupAttribute : AttributeGroupInterface = createEmptyGroupAttribute();
	public categories : CategoryInterface[] = [];
	
	private destroy$ = new Subject<void>();
	public errorMsmServerListAttributes: string = '';
	public errorMsmServerGroup: string = '';

	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public attributes: AttributeInterface[] = [];
	public columns = [
		{ key: 'name', label: 'Atributo', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-200 col-w-md-250' },
	];
	public pageLimit = pageLimit;
	public statusTable = statusTable;
	public sortColumns = sortColumnsAttributes;
	public selectedIds = new Set<string>();
	public id : string = '';
	
	constructor(
		private _router: Router,
		private attributeService: AttributeService,
		private categoryService:CategoryService,
		private _route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.initGroup();
	}

	initGroup(): void {
		this._route.params
		.pipe(
			takeUntil(this.destroy$),
			switchMap(params => {
				this.id = params['id'];
				this.loadAttributeGroup = true;

				return this.attributeService
					.get_attribute_and_categories(this.id)
					.pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => this.loadAttributeGroup = false)
					);
			})
		)
		.subscribe({
			next: (resp: any) => {
				this.groupAttribute = resp.data.attributeGroup;
				this.categories = resp.data.categories;
				this.initAttributes();
			},
			error: (err) => {
				this.loading = false;
				this.errorMsmServerGroup = err.error;
			}
		});
	}

	initAttributes(): void {
		this._route.queryParams
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				filter(queryParams => {
					const sortArrStr = sortColumnsAttributes.map(item => item.value);
					return ValidateQPAttributes(
						this._route,
						queryParams,
						this._router,
						sortArrStr
					);
				}),
				switchMap(queryParams => {
					this.filter = queryParams['filter'] || '';
					this.currentPage = Number(queryParams['page']) || 1;
					this.status = queryParams['status'] || 'Todos';
					this.limit = Number(queryParams['limit']) || 10;
					this.sort = queryParams['sort'] || 'Predeterminado';

					this.loading = true;

					// Reset
					this.attributes = [];
					this.currentPage = 1;
					this.totalPages = 1;
					this.errorMsmServerListAttributes = '';

					return this.attributeService.get_attributes(
						this.id,
						this.filter,
						this.currentPage,
						this.status,
						this.limit,
						this.sort
					).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => this.loading = false)
					);
				})
			)
			.subscribe({
				next: (data: any) => {
					this.attributes = data.attributes;
					this.currentPage = data.meta.currentPage;
					this.totalPages = data.meta.totalPages;
				},
				error: (err) => {
					this.errorMsmServerListAttributes = err.error;
				}
			});
	}


	onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

	hasSelectedAttributes(): boolean {
		return this.selectedIds.size > 0;
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	redirect() {
		this._router.navigate([`/products/attributes/groups/${this.id}/attributes`], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.status,
				sort: this.sort
			},
		});
	}

	setLimit() {
		this.currentPage = 1;
		this.redirect();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.redirect(); // o init_collaborators()
	}

	setStatus(id: string, status: boolean) {
		this.loadBtnDelete.set(true);
		this.attributeService
			.update_status_attribute(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: {data: AttributeInterface, message: string}) => {
					this.attributes = this.attributes.map((prev: any) => {
						if (next.data.id === prev.id) {
							return { ...prev, status: next.data.status };
						}
						return prev;
					});

					toastr.success(next.message);
					closeModal(id);
				},
				error: (error: any) => {
					toastr.error(error.error.message);
				},
			});
	}

	resetFilters(){
		this.filter = '';
		this.status = 'Todos';
		this.sort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;

		this._router.navigate([], {
			queryParams: {
				filter: null,
				page: 1,
				limit: 10,
				status: null,
				sort: null,
				categories: null,
			},
			queryParamsHandling: 'merge',
		});
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
		this.attributeService
		.update_status_attributes({
			ids: this.getSelectedIds(),
			status
		})
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => this.loadBtnMultipleStatus.set(false))
		)
		.subscribe({
			next: (next: {data: any, message: string}) => {
				console.log(next);
				
				this.attributes = this.attributes.map((prev: AttributeInterface) => {
					if (next.data.includes(prev.id)) {
						return { ...prev, status: status };
					}
					return prev;
				});

				toastr.success(next.message);
				closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
				this.selectedIds.clear();
			},
			error: (error: any) => {
				toastr.error(error.error.message);
			},
		});
	}
}
