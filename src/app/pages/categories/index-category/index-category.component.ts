import { CommonModule } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
import { statusTable } from '@app/common/constants/statusTable.contant';
import { CategoryList } from '@app/common/interface/category-list.interface';
import { Category } from '@app/common/interface/category.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { getColorBasedOnLetter } from '@app/common/utils/get-color-based-on-letter.util';
import { sortColumnsTable } from '@app/common/utils/sort-columns-table.util';
import { ValidateQueryParams } from '@app/common/utils/validate-query-params.util';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil } from 'rxjs';
import { sortColumnsCategories } from '../constants/sortColumnsCategories.constant';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-index-category',
	imports: [TopbarComponent, SidebarComponent, CommonModule, RouterModule, FormsModule, ModalDeleteComponent, PaginationComponent, NotFoundComponent, NgSelectModule],
	templateUrl: './index-category.component.html',
	styleUrl: './index-category.component.css',
})
export class IndexCategoryComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public currentPage: number = 1;
	public limit: number = 10;
	public sort: string = 'Predeterminado';
	public totalPages: number = 0;
	public loading: boolean = true;
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public categories: CategoryList[] = [];
	public screenHeight = window.innerHeight;
	public errorMsmServerListCategories: string = '';
	private destroy$ = new Subject<void>();
	public columns = [
		{ key: 'name', label: 'Categoría', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-200 col-w-md-250' },
	];
	public sortColumn: string = '';
	public sortDirection: 'asc' | 'desc' = 'asc';
	public pageLimit = pageLimit;
	public statusTable = statusTable;
	public sortColumns = sortColumnsCategories

	constructor(
		private _router: Router,
		private categoryService: CategoryService,
		private _route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this._route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const sortArrStr = sortColumnsCategories.map(item => item.value);
			const isValid = ValidateQueryParams(this._route, params, this._router, sortArrStr);
			if (!isValid) return;

			this.filter = params['filter'] || '';
			this.currentPage = Number(params['page']);
			this.limit = Number(params['limit']);
			this.status = params['status'];
			this.sort = params['sort'];
			this.init_categories(this.filter, this.currentPage, this.status, this.limit, this.sort);
		});
	}

	onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

	sortData(column: string) {
		const result = sortColumnsTable(this.categories, column, this.sortColumn, this.sortDirection);

		this.categories = result.sortedData;
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

	init_categories(filter: string, page: number, status: string, limit: number, sort: string) {
		this.loading = true;
		this.errorMsmServerListCategories = '';
		this.categoryService
			.get_categories(filter, page, limit, status, sort)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { categories: CategoryList[]; currentPage: number; totalCollaborators: number; totalPages: number }) => {
					this.categories = next.categories.map((i) => ({
						...i,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(i.icon),
					}));
					this.totalPages = next.totalPages;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerListCategories = error;
				},
			});
	}

	getColorBasedOnLetter(str: string) {
		return getColorBasedOnLetter(str);
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
		this.categoryService
			.update_status_category(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: Category) => {
					this.categories = this.categories.map((prev: Category) => {
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

	redirect() {
		this._router.navigate(['/products/categories'], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.status,
				sort: this.sort
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
			},
			queryParamsHandling: 'merge',
		});
	}
}
