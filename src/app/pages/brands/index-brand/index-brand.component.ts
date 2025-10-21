import { CommonModule } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BrandList } from '@app/common/interface/brand-list.interface';
import { Brand } from '@app/common/interface/brand.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { sortColumnsTable } from '@app/common/utils/sort-columns-table.util';
import { ValidateQueryParams } from '@app/common/utils/validate-query-params.util';
import { BrandService } from '@app/services/brand.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-index-brand',
	imports: [TopbarComponent, SidebarComponent, RouterModule, CommonModule, FormsModule, ModalDeleteComponent, PaginationComponent, NotFoundComponent],
	templateUrl: './index-brand.component.html',
	styleUrl: './index-brand.component.css',
})
export class IndexBrandComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public currentPage: number = 1;
	public limit: number = 10;
	public totalPages: number = 0;
	public loading: boolean = true;
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public brands: any[] = [];
	public screenHeight = window.innerHeight;
	public errorMsmServerListBrands: string = '';
	private destroy$ = new Subject<void>();
	public columns = [
		{ key: 'name', label: 'Marca', width: '50%' },
		{ key: 'status', label: 'Estado', width: '40%' },
	];
	public sortColumn: string = '';
	public sortDirection: 'asc' | 'desc' = 'asc';

	constructor(
		private _router: Router,
		private brandService: BrandService,
		private _route: ActivatedRoute
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit() {
		this._route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const isValid = ValidateQueryParams(this._route, params, this._router);
			if (!isValid) return;

			this.filter = params['filter'] || '';
			this.currentPage = Number(params['page']);
			this.limit = Number(params['limit']);
			this.status = params['status'];

			this.init_brands(this.filter, this.currentPage, this.status, this.limit);
		});
	}

	onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

	sortData(column: string) {
		const result = sortColumnsTable(this.brands, column, this.sortColumn, this.sortDirection);

		this.brands = result.sortedData;
		this.sortColumn = result.sortColumn;
		this.sortDirection = result.sortDirection;
	}

	getSortIcon(column: string): string {
		if (this.sortColumn !== column) return 'bi-arrow-down-up'; // Icono neutro
		return this.sortDirection === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down';
	}

	init_brands(filter: string, page: number, status: string, limit: number) {
		this.loading = true;
		this.errorMsmServerListBrands = '';
		this.brandService
			.get_brands(filter, page, limit, status)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { brands: BrandList[]; currentPage: number; totalCollaborators: number; totalPages: number }) => {
					this.brands = next.brands;
					this.totalPages = next.totalPages;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerListBrands = error;
				},
			});
	}

	redirect() {
		this._router.navigate(['/products/brands'], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.status,
			},
		});
	}

	setStatus(id: string, status: boolean) {
		this.loadBtnDelete.set(true);
		this.brandService
			.update_status_brand(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: Brand) => {
					this.brands = this.brands.map((prev: Brand) => {
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

	setLimit() {
		this.currentPage = 1;
		this.redirect();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.redirect(); // o init_collaborators()
	}
}
