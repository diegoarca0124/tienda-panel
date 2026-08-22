import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { BrandService } from '@app/services/brand.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil } from 'rxjs';
import { sortColumnsBrands } from '../constants/sort-columns-brands.constant';
import { BrandInterface } from '../interfaces/brand.interface';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ValidateQPBrands } from '../utils/validate-pq-brands.util';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from '../../../common/pipes/pad-code.pipe';
import { countries } from '@app/common/constants/countries.constant';
import { HttpErrorResponse } from '@angular/common/http';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-index-brand',
	imports: [
		TopbarComponent,
		SidebarComponent,
		RouterModule,
		CommonModule,
		FormsModule,
		ModalDeleteComponent,
		PaginationComponent,
		NotFoundComponent,
		NgSelectModule,
		NgbTooltipModule,
		FallbackImageDirective,
		PadCodePipe,
	],
	templateUrl: './index-brand.component.html',
	styleUrl: './index-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IndexBrandComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public loadBtnMultipleStatus: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public sort: string = 'Predeterminado';
	public currentPage: number = 1;
	public limit: number = 10;
	public totalPages: number = 0;
	public loading: boolean = true;
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public brands: BrandInterface[] = [];
	public screenHeight = window.innerHeight;
	public errorMsmServerListBrands: string = '';
	private destroy$ = new Subject<void>();
	public columns = [
		{ key: 'name', label: 'Marca', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-200 col-w-md-250' },
	];
	public pageLimit = pageLimit;
	public statusTable = [];
	public sortColumns = sortColumnsBrands;
	public selectedIds = new Set<string>();

	public countries: any = '';

	public readonly sortValues = sortColumnsBrands.map((item) => item.value);
	public readonly filterCountries = countries.map((item) => item.code);

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
			if (!ValidateQPBrands(this._route, params, this._router, this.sortValues, this.filterCountries)) return;

			this.loadQueryParams(params);
			this.init_brands(this.filter, this.currentPage, this.status, this.countries, this.limit, this.sort);
		});
	}

	private loadQueryParams(params: Params): void {
		this.filter = params['filter'] || '';
		this.currentPage = Number(params['page']);
		this.limit = Number(params['limit']);
		this.status = params['status'];
		this.sort = params['sort'];
		this.countries = params['countries'];
	}

	onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

	getCountries(countries: any) {
		if (countries.length >= 1) {
			this.countries = countries.join(',');
		} else {
			this.countries = 'Todos';
		}
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

	hasSelectedBrands(): boolean {
		return this.selectedIds.size > 0;
	}

	init_brands(filter: string, page: number, status: string, countries: string, limit: number, sort: string) {
		this.loading = true;
		this.errorMsmServerListBrands = '';
		this.brands = [];
		this.brandService
			.get_brands(filter, page, limit, status, countries, sort)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { brands: BrandInterface[]; meta: any }) => {
					this.brands = this.mapBrands(next.brands);
					this.currentPage = next.meta.currentPage;
					this.totalPages = next.meta.totalPages;
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.errorMsmServerListBrands = error;
				},
			});
	}

	private mapBrands(brands: BrandInterface[]): BrandInterface[] {
		return brands.map((brand) => ({
			...brand,
			logoUrl: `${environment.s3_public_url}/brands/small/${brand.logoUrl}`,
			productsPreview: (brand.productsPreview ?? []).map((product) => ({
				...product,
				cover: `${environment.s3_public_url}/products/small/${product.cover}`,
			})),
		}));
	}

	redirect() {
		const queryParams = {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.status,
			sort: this.sort,
			countries: this.countries,
		};

		const current: any = this._route.snapshot.queryParams;

		const same =
			(current.filter ?? '') === queryParams.filter &&
			Number(current.page) === queryParams.page &&
			Number(current.limit) === queryParams.limit &&
			(current.status ?? 'Todos') === queryParams.status &&
			(current.sort ?? 'Predeterminado') === queryParams.sort &&
			(current.countries ?? 'Todos') === queryParams.countries;

		if (same) {
			this.init_brands(this.filter, this.currentPage, this.status, this.countries, this.limit, this.sort);
			return;
		}

		this._router.navigate(['/products/brands'], {
			queryParams,
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
				next: (next: { data: BrandInterface; message: string }) => {
					const brand = this.brands.find((c) => c.id === next.data.id);
					if (brand) {
						brand.status = next.data.status;
					}
					toastr.success(next.message);
					closeModal('modalDelete-' + id);
				},
				error: (error: HttpErrorResponse) => {
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

	resetFilters() {
		this.filter = '';
		this.status = 'Todos';
		this.countries = 'Todos';
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
				countries: null,
			},
			queryParamsHandling: 'merge',
		});
	}

	onUpdateStatusMultiple(status: boolean) {
		this.loadBtnMultipleStatus.set(true);
		this.brandService
			.update_status_brands({
				ids: this.getSelectedIds(),
				status,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnMultipleStatus.set(false))
			)
			.subscribe({
				next: (next: { data: string[]; message: string }) => {
					console.log(next);
					const updatedIds = new Set(next.data);
					this.brands = this.brands.map((prev) => {
						if (updatedIds.has(prev.id!)) {
							return {
								...prev,
								status,
							};
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
