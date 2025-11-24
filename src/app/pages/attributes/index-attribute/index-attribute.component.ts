import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
import { statusTable } from '@app/common/constants/statusTable.contant';
import { AttributeList } from '@app/common/interface/attribute-list.interface';
import { Attribute } from '@app/common/interface/attribute.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { sortColumnsTable } from '@app/common/utils/sort-columns-table.util';
import { ValidateQueryParams } from '@app/common/utils/validate-query-params.util';
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
import { filter, finalize, forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
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
})
export class IndexAttributeComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public currentPage: number = 1;
	public limit: number = 10;
	public totalPages: number = 0;
	public loading: boolean = true;
	
	private destroy$ = new Subject<void>();
	public errorMsmServerListAttributes: string = '';

	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public attributes: AttributeList[] = [];
	public categories: any = '';
	public categoriesSelected: any = [];
	public columns = [
		{ key: 'name', label: 'Atributo', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-200 col-w-md-250' },
	];
	public sortColumn: string = '';
	public sortDirection: 'asc' | 'desc' = 'asc';
	public pageLimit = pageLimit;
	public statusTable = statusTable;
	
	constructor(
		private _router: Router,
		private attributeService: AttributeService,
		private categoryService:CategoryService,
		private _route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this._route.queryParams
			.pipe(
				takeUntil(this.destroy$),
				filter((params) => ValidateQueryParams(this._route, params, this._router))
			)
			.subscribe((params) => {
				// ✅ Prepara parámetros con fallback
				const queryCategory = params['categories'] ?? 'Todos';
				this.filter = params['filter'] || '';
				this.currentPage = Number(params['page']) || 1;
				this.limit = Number(params['limit']) || 10;
				this.status = params['status'] ?? '';

				// ✅ Evita bucle de navegación
				if (this.categories !== queryCategory) {
					this.categories = queryCategory;
					this._router.navigate([], {
						relativeTo: this._route,
						queryParams: { ...params, categories: this.categories },
						queryParamsHandling: 'merge',
						replaceUrl: true,
					});
				} else {
					this.categories = queryCategory;
				}

				// ✅ Cargar datos independientes
				this.init_attributes(this.filter, this.currentPage, this.status, this.limit, this.categories);
			});
	}

	onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

	sortData(column: string) {
		const result = sortColumnsTable(this.attributes, column, this.sortColumn, this.sortDirection);
		this.attributes = result.sortedData;
		this.sortColumn = result.sortColumn;
		this.sortDirection = result.sortDirection;
	}

	getSortIcon(column: string): string {
		if (this.sortColumn !== column) return 'bi-arrow-down-up'; // Icono neutro
		return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	redirect() {
		this._router.navigate(['/products/attributes'], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.status,
				categories: this.categoriesSelected.join(','),
			},
		});
	}

	init_attributes(filter: string, page: number, status: string, limit: number, categories: string) {
		this.loading = true;
		this.errorMsmServerListAttributes = '';
		this.attributeService
			.get_attributes(filter, page, limit, status, categories)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { attributes: AttributeList[]; currentPage: number; totalCollaborators: number; totalPages: number }) => {
					this.attributes = next.attributes;
					this.totalPages = next.totalPages;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerListAttributes = error;
				},
			});
	}

	

	getCategories(categories: any){
		console.log(categories);
		this.categoriesSelected = categories
		.filter((c: any) => c.checked)
		.map((c: any) => c.id);
		this.redirect();
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
				next: (next: Attribute) => {
					this.attributes = this.attributes.map((prev: any) => {
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
}
