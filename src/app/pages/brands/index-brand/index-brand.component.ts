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
import { catchError, finalize, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { sortColumnsBrands } from '../constants/sort-columns-brands.constant';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { validateBrandsQueryParams } from '../utils/validate-brands-query-params.util';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from '../../../common/pipes/pad-code.pipe';
import { countries } from '@app/common/constants/countries.constant';
import { HttpErrorResponse } from '@angular/common/http';
import { GetBrandsQPI } from '../interfaces/query-params.interface';
import { sortOptions, statusOptions } from '../constants/selectors.constant';
import { GetBrandsRESI } from '../interfaces/response.interface';
import { BrandInterface } from '../interfaces/data.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { MenuCountriesComponent } from '@app/shared/menu-countries/menu-countries.component';
declare const toastr: any;
declare const $: any;
type BrandsLoadResult = { data: GetBrandsRESI; error: null } | { data: null; error: HttpErrorResponse };

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
		MenuCountriesComponent,
	],
	templateUrl: './index-brand.component.html',
	styleUrl: './index-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IndexBrandComponent {
	private destroy$ = new Subject<void>();
	private readonly brandsQuery$ = new Subject<GetBrandsQPI>();

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedSort: string = 'Predeterminado';
	public selectedCountries: string = 'Todos';
	public selectedCountryCodes: string[] = [];

	public currentPage: number = 1;
	public totalPages: number = 0;
	public limit: number = 10;

	public readonly statusFilters = statusOptions;
	public readonly sortFilters = sortOptions;

	public selectedBrandsIds = new Set<string>();
	public isBrandsLoading: boolean = true;
	public brandsLoadError: Record<string, any> | null = null;

	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingMultipleStatuses: WritableSignal<boolean> = signal(false);

	public brands: BrandInterface[] = [];
	public screenHeight = window.innerHeight;

	public readonly sortValues = sortOptions.map((item) => item.value);
	public readonly countriesValues = countries.map((item) => item.code);

	constructor(
		private router: Router,
		private brandService: BrandService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit() {
		this.listenBrandsQueries();
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const validParams = validateBrandsQueryParams(this.route, params, this.router, this.sortValues, this.countriesValues);
			if (!validParams) return;
			this.loadQueryParams(params);
			this.loadBrands();
		});
	}

	private loadBrands(): void {
		this.brandsQuery$.next({
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			countries: this.selectedCountries,
		});
	}

	private listenBrandsQueries(): void {
		this.brandsQuery$
			.pipe(
				switchMap((query) => {
					this.isBrandsLoading = true;
					this.brandsLoadError = null;
					return this.brandService.getBrands(query).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						map(
							(data): BrandsLoadResult => ({
								data,
								error: null,
							})
						),
						catchError((error: HttpErrorResponse) =>
							of<BrandsLoadResult>({
								data: null,
								error,
							})
						)
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe(({ data, error }) => {
				this.isBrandsLoading = false;
				if (error) {
					this.brandsLoadError = error.error;
					return;
				}
				if (!data) return;
				this.selectedBrandsIds.clear();
				this.brands = this.mapBrands(data.brands);
				this.totalPages = data.meta.totalPages;
				this.syncCurrentPage(data.meta.currentPage);
			});
	}

	syncCurrentPage(currentPage: number): void {
		if (this.currentPage === currentPage) return;

		this.currentPage = currentPage;

		this.router.navigate([], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.selectedStatus,
				sort: this.selectedSort,
				countries: this.selectedCountries,
			},
			replaceUrl: true,
		});
	}

	private mapBrands(brands: BrandInterface[]): BrandInterface[] {
		return brands.map((brand) => ({
			...brand,
			logoUrl: `${environment.s3_public_url}/brands/small/${brand.logoUrl}`,
			latestProducts: (brand.latestProducts ?? []).map((product) => ({
				...product,
				cover: product.cover ? `${environment.s3_public_url}/products/small/${product.cover}` : '',
			})),
		}));
	}

	private loadQueryParams(params: Params): void {
		this.filter = params['filter'] || '';
		this.currentPage = Number(params['page']);
		this.limit = Number(params['limit']);
		this.selectedStatus = params['status'];
		this.selectedSort = params['sort'];
		this.selectedCountries = params['countries'];
		this.selectedCountryCodes = this.selectedCountries === 'Todos' ? [] : this.selectedCountries.split(',').filter(Boolean);
	}

	private refreshBrands(): void {
		this.brandService
			.getBrands({
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.selectedStatus,
				sort: this.selectedSort,
				countries: this.selectedCountries,
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response: GetBrandsRESI) => {
					this.brands = this.mapBrands(response.brands);
					this.totalPages = response.meta.totalPages;
					this.syncCurrentPage(response.meta.currentPage);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error?.message || 'No fue posible actualizar la lista.');
				},
			});
	}

	getCountries(countries: string[]): void {
		this.selectedCountryCodes = [...countries];
		if (countries.length >= 1) {
			this.selectedCountries = countries.join(',');
		} else {
			this.selectedCountries = 'Todos';
		}
	}

	onBrandsSelectionChange(id: string, checked: boolean): void {
		if (checked) {
			this.selectedBrandsIds.add(id);
		} else {
			this.selectedBrandsIds.delete(id);
		}
	}

	get hasSelectedBrands(): boolean {
		return this.selectedBrandsIds.size > 0;
	}

	clearBrandsSelection(): void {
		this.selectedBrandsIds.clear();
	}

	selectAllBrands(): void {
		this.selectedBrandsIds = new Set(this.brands.map((brand) => brand.id).filter((id): id is string => Boolean(id)));
	}

	get areAllBrandsSelected(): boolean {
		return this.brands.length > 0 && this.brands.every((brand) => Boolean(brand.id) && this.selectedBrandsIds.has(brand.id!));
	}

	onLimitChange() {
		this.applyFilters(true);
	}

	onPageChange(newPage: number): void {
		if (newPage === this.currentPage) return;

		this.currentPage = newPage;
		this.applyFilters(false);
	}

	resetFilters() {
		this.filter = '';
		this.selectedStatus = 'Todos';
		this.selectedSort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;
		this.selectedCountries = 'Todos';
		this.selectedCountryCodes = [];

		this.router.navigate([], {
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

	applyFilters(resetPage: boolean = true): void {
		if (resetPage) {
			this.currentPage = 1;
		}

		const normalizedFilter = typeof this.filter === 'string' ? this.filter.trim().slice(0, 50) : '';

		this.filter = normalizedFilter;

		const queryParams = {
			filter: normalizedFilter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			countries: this.selectedCountries,
		};

		const current = this.route.snapshot.queryParams;

		const same =
			(current['filter'] ?? '') === queryParams.filter &&
			Number(current['page'] ?? 1) === queryParams.page &&
			Number(current['limit'] ?? 10) === queryParams.limit &&
			(current['status'] ?? 'Todos') === queryParams.status &&
			(current['sort'] ?? 'Predeterminado') === queryParams.sort &&
			(current['countries'] ?? 'Todos') === queryParams.countries;

		if (same) {
			this.loadBrands();
			return;
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams,
		});
	}

	onUpdateStatus(id: string, status: boolean) {
		/* this.isUpdatingSingleStatus.set(true);
		this.categoryService
			.updateCategoryStatus(id, { status: !status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingSingleStatus.set(false))
			)
			.subscribe({
				next: (next: UpdateCategoryStatusRESI) => {
					toastr.success(next.message);
					closeModal(`modalDelete-${id}`);
					this.refreshCategories();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error?.message || 'No fue posible actualizar el estado.');
				},
			}); */
	}

	onUpdateStatusMultiple(status: boolean) {
		/* this.isUpdatingMultipleStatuses.set(true);
		this.brandService
			.updateCategoriesStatus({
				ids: [...this.selectedCategoriesIds],
				status,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingMultipleStatuses.set(false))
			)
			.subscribe({
				next: (next: UpdateCategoriesStatusRESI) => {
					toastr.success(next.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedCategoriesIds.clear();
					this.refreshCategories();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error?.message || 'No fue posible actualizar el estado.');
				},
			}); */
	}
}
