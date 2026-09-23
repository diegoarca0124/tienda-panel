import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { ProductInterface } from '@app/pages/products/interfaces/product.interface';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, combineLatest, EMPTY, filter, finalize, forkJoin, map, Observable, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from '../../../common/pipes/pad-code.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencySymbolPipe } from '../../../common/pipes/currency-symbol.pipe';
import { CategoryService } from '@app/services/category.service';
import { CategoryInterface } from '@app/pages/categories/interfaces/data.interface';
import { qualityOptions, sortOptions, statusOptions, visibilityOptions } from '@app/pages/products/constants/selectors.constant';
import { validateProductsBrandQueryParams } from '../utils/validate-productsbrand-query-params..util';
import { FindBrandProductsRESI, GetCategoriesWithSubcategoriesRESI } from '../interfaces/response.interface';
import { MenuSubcategoriesComponent } from '@app/shared/menu-subcategories/menu-subcategories.component';
import { InputDialerComponent } from '@app/shared/input-dialer/input-dialer.component';
import { BrandService } from '@app/services/brand.service';
declare const toastr: any;

@Component({
	selector: 'app-products-brand',
	imports: [
		CommonModule,
		TopbarComponent,
		SidebarComponent,
		RouterModule,
		FormsModule,
		PaginationComponent,
		NgSelectModule,
		MenuSubcategoriesComponent,
		NotFoundComponent,
		FallbackImageDirective,
		PadCodePipe,
		CurrencySymbolPipe,
		InputDialerComponent,
	],
	templateUrl: './products-brand.component.html',
	styleUrl: './products-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsBrandComponent {
	private destroy$ = new Subject<void>();
	
	public id: string = '';
	public categories: CategoryInterface[] = [];
	public products: ProductInterface[] = [];

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedQuality: string = 'Todos';
	public selectedVisibility: string = 'Todos';
	public selectedSort: string = 'Predeterminado';
	public selectedSubcategoryIds: string = 'Todos';
	public minPrice: number | null = null;
	public maxPrice: number | null = null;

	public currentPage: number = 1;
	public totalPages: number = 0;
	public limit: number = 10;

	public selectedProductsIds = new Set<string>();

	public expandedCategoryIndex: number | null = 0;

	public isCategoriesLoading: boolean = false;
	public isProductsLoading: boolean = true;

	public categoryLoadError: Record<string, any> | null = null;
	public categoriesLoadError: Record<string, any> | null = null;
	public productsLoadError: Record<string, any> | null = null;

	public readonly statusFilters = statusOptions;
	public readonly qualityFilters = qualityOptions;
	public readonly visibilityFilters = visibilityOptions;
	public readonly sortFilters = sortOptions;
	public readonly sortValues = sortOptions.map((item) => item.value);

	readonly qualityLabels: Record<string, string> = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta',
	};

	constructor(
		private router: Router,
		private brandService: BrandService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this.listenRouteChanges();
	}

	private listenRouteChanges(): void {
		combineLatest([this.route.paramMap, this.route.queryParams])
			.pipe(
				switchMap(([paramMap, queryParams]) => {
					const categoryId = paramMap.get('id');

					if (!categoryId) {
						this.categoryLoadError = {
							message: 'No se encontró la categoría.',
							statusCode: 400,
						};

						return EMPTY;
					}

					const validParams = validateProductsBrandQueryParams(this.route, queryParams, this.router, this.sortValues);

					if (!validParams) {
						return EMPTY;
					}

					this.id = categoryId;
					this.loadQueryParams(queryParams);

					return this.loadProducts$();
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private loadQueryParams(params: Params): void {
		this.filter = params['filter'] ?? '';
		this.currentPage = Number(params['page']);
		this.limit = Number(params['limit']);
		this.selectedStatus = params['status'];
		this.selectedSort = params['sort'];

		this.selectedSubcategoryIds = params['subcategoryIds'] ?? 'Todos';

		this.selectedQuality = params['quality'] ?? 'Todos';

		this.selectedVisibility = params['visibility'] ?? 'Todos';

		this.minPrice = params['minPrice'] !== undefined ? Number(params['minPrice']) : null;

		this.maxPrice = params['maxPrice'] !== undefined ? Number(params['maxPrice']) : null;
	}

	private loadProducts$(showSpinner: boolean = true): Observable<void> {
		if (showSpinner) {
			this.isProductsLoading = true;
			this.productsLoadError = null;
			this.products = [];
		}

		const request$ = this.brandService.findBrandProducts(this.id, {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			subcategoryIds: this.selectedSubcategoryIds,
			quality: this.selectedQuality,
			visibility: this.selectedVisibility,
			minPrice: this.minPrice,
			maxPrice: this.maxPrice,
		});

		const productsRequest$ = showSpinner ? request$.pipe(withMinLoadingTime(GLOBAL.MIN_LOADING_TIME)) : request$;

		return productsRequest$.pipe(
			tap((response: FindBrandProductsRESI) => {
				this.productsLoadError = null;

				this.products = response.products.map((product: ProductInterface) => ({
					...product,
					cover: `${environment.s3_public_url}/products/small/${product.cover}`,
					brand: {
						...product.brand,
						logoUrl: `${environment.s3_public_url}/brands/small/${product.brand.logoUrl}`,
					},
				}));

				this.totalPages = response.meta.totalPages;
				this.selectedProductsIds.clear();

				this.syncCurrentPage(response.meta.currentPage);
			}),

			map(() => void 0),

			catchError((error: HttpErrorResponse) => {
				if (!showSpinner) {
					return throwError(() => error);
				}

				this.productsLoadError = error.error ?? {
					message: 'No fue posible cargar los productos.',
					statusCode: error.status,
				};

				this.products = [];
				this.totalPages = 0;

				return EMPTY;
			}),

			finalize(() => {
				if (showSpinner) {
					this.isProductsLoading = false;
				}
			})
		);
	}

	private refreshProducts(): void {
		this.loadProducts$(false)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				error: () => {
					toastr.error('Los productos se movieron, pero no fue posible actualizar la tabla.');
				},
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
				subcategoryIds: this.selectedSubcategoryIds,
				quality: this.selectedQuality,
				visibility: this.selectedVisibility,
				minPrice: this.minPrice,
				maxPrice: this.maxPrice,
			},
			replaceUrl: true,
		});
	}

	onMinPriceChange(price: number | null): void {
		if (price === null || price === undefined || price === ('' as any)) {
			this.minPrice = null;
			return;
		}

		const parsedPrice = Number(price);

		this.minPrice = Number.isFinite(parsedPrice) ? parsedPrice : null;
	}

	onMaxPriceChange(price: number | null): void {
		if (price === null || price === undefined || price === ('' as any)) {
			this.maxPrice = null;
			return;
		}

		const parsedPrice = Number(price);

		this.maxPrice = Number.isFinite(parsedPrice) ? parsedPrice : null;
	}

	onLimitChange() {
		this.applyFilters();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onPageChange(newPage: number) {
		if (newPage === this.currentPage) return;

		this.currentPage = newPage;
		this.applyFilters(false);
	}

	resetFilters() {
		this.filter = '';
		this.selectedStatus = 'Todos';
		this.currentPage = 1;
		this.limit = 10;
		this.selectedSort = 'Predeterminado';
		this.selectedSubcategoryIds = 'Todos';
		this.selectedQuality = 'Todos';
		this.selectedVisibility = 'Todos';
		this.minPrice = null;
		this.maxPrice = null;

		this.router.navigate([], {
			queryParams: {
				page: 1,
				limit: 10,
				filter: null,
				status: null,
				sort: null,
				subcategoryIds: null,
				quality: null,
				visibility: null,
				minPrice: null,
				maxPrice: null,
			},
			queryParamsHandling: 'merge',
		});
	}

	initProducts(): void {
		this.loadProducts$().pipe(takeUntil(this.destroy$)).subscribe();
	}

	applyFilters(resetPage: boolean = true): void {
		if (resetPage) {
			this.currentPage = 1;
		}

		this.filter = typeof this.filter === 'string' ? this.filter.trim().slice(0, 50) : '';

		const queryParams: Params = {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			subcategoryIds: this.selectedSubcategoryIds,
			quality: this.selectedQuality,
			visibility: this.selectedVisibility,
		};

		if (this.minPrice !== null) {
			queryParams['minPrice'] = this.minPrice;
		}

		if (this.maxPrice !== null) {
			queryParams['maxPrice'] = this.maxPrice;
		}

		const current = this.route.snapshot.queryParams;

		const currentMinPrice = current['minPrice'] !== undefined ? Number(current['minPrice']) : null;

		const currentMaxPrice = current['maxPrice'] !== undefined ? Number(current['maxPrice']) : null;

		const same =
			(current['filter'] ?? '') === this.filter &&
			Number(current['page'] ?? 1) === this.currentPage &&
			Number(current['limit'] ?? 10) === this.limit &&
			(current['status'] ?? 'Todos') === this.selectedStatus &&
			(current['sort'] ?? 'Predeterminado') === this.selectedSort &&
			(current['subcategoryIds'] ?? 'Todos') === this.selectedSubcategoryIds &&
			(current['quality'] ?? 'Todos') === this.selectedQuality &&
			(current['visibility'] ?? 'Todos') === this.selectedVisibility &&
			currentMinPrice === this.minPrice &&
			currentMaxPrice === this.maxPrice;

		if (same) {
			this.initProducts();
			return;
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams,
		});
	}

	toggleCategory(index: number) {
		this.expandedCategoryIndex = this.expandedCategoryIndex === index ? null : index;
	}

	hasSelectedProducts(): boolean {
		return this.selectedProductsIds.size > 0;
	}


	onProductSelectionChange(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			this.selectedProductsIds.add(id);
		} else {
			this.selectedProductsIds.delete(id);
		}
	}
}
