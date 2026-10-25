import { getHttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { BrandService } from '@app/services/brand.service';
import { CategoryService } from '@app/services/category.service';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { catchError, combineLatest, EMPTY, finalize, map, Observable, startWith, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { FormsModule } from '@angular/forms';
import { validateProductsBrandQueryParams } from '../utils/validate-productsbrand-query-params..util';
import { environment } from 'environments/environment.dev';
import { HttpErrorResponse } from '@angular/common/http';
import { MoveProductsInterface } from '@app/pages/categories/interfaces/data.interface';
import {
	CategoryProductInterface,
	CategoryWithSubcategoriesRESI,
	GetCategoriesWithSubcategoriesRESI,
	MappingSubcategoryInterface,
	MoveProductsToSubcategoryRESI,
} from '@app/pages/categories/interfaces/response.interface';
import { GetProductsBrandQPI } from '../interfaces/query-params.interface';
import { FindBrandProductsRESI } from '../interfaces/response.interface';
import { SidebarProductsBrandComponent } from './shared/sidebar-products-brand/sidebar-products-brand.component';
import { TableProductsBrandComponent } from './components/table-products-brand/table-products-brand.component';
import { MoveProductsCategoryComponent } from '@app/pages/categories/products-category/components/move-products-category/move-products-category.component';
declare var toastr: any;

@Component({
	selector: 'app-products-brand',
	imports: [CommonModule, TopbarComponent, SidebarComponent, RouterModule, FormsModule, SidebarProductsBrandComponent, TableProductsBrandComponent, MoveProductsCategoryComponent],
	templateUrl: './products-brand.component.html',
	styleUrl: './products-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsBrandComponent {
	private destroy$ = new Subject<void>();
	private readonly productsRefresh$ = new Subject<void>();
	private readonly categoriesRefresh$ = new Subject<void>();
	private readonly cancelBrandContext$ = new Subject<void>();
	private contextVersion = 0;

	public id: string = '';
	public brandName: string = '';
	public categories: CategoryWithSubcategoriesRESI[] = [];
	public products: CategoryProductInterface[] = [];

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedQuality: string = 'Todos';
	public selectedVisibility: string = 'Todos';
	public selectedSort: string = 'Predeterminado';
	public selectedSubcategoryIds: string = 'Todos';
	public selectedCategoryIds: string = 'Todos';
	public minPrice: number | null = null;
	public maxPrice: number | null = null;

	public currentPage: number = 1;
	public totalPages: number = 0;
	public limit: number = 10;

	public selectedProductsIds = new Set<string>();

	public movingToSubcategoryId: string | null = null;

	public isCategoriesLoading: boolean = false;
	public isProductsLoading: boolean = true;
	public isMovingProducts: boolean = false;

	public categoriesLoadError: Record<string, any> | null = null;
	public productsLoadError: Record<string, any> | null = null;

	constructor(
		private router: Router,
		private categoryService: CategoryService,
		private brandService: BrandService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this.listenRouteChanges();
		this.categoriesRefresh$
			.pipe(
				startWith(void 0),
				switchMap(() => this.loadCategories$()),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private listenRouteChanges(): void {
		combineLatest([this.route.paramMap, this.route.queryParams, this.productsRefresh$.pipe(startWith(void 0))])
			.pipe(
				switchMap(([paramMap, params]) => {
					const brandId = paramMap.get('id');

					if (!brandId) {
						this.contextVersion++;
						this.cancelBrandContext$.next();
						this.id = '';
						this.brandName = '';
						this.isMovingProducts = false;
						this.movingToSubcategoryId = null;
						this.products = [];
						this.selectedProductsIds.clear();
						this.totalPages = 0;
						this.isProductsLoading = false;
						this.productsLoadError = {
							message: 'No se encontró la marca.',
							statusCode: 400,
						};

						return EMPTY;
					}
					if (this.id !== brandId) {
						this.contextVersion++;
						this.cancelBrandContext$.next();
						this.id = brandId;
						this.brandName = '';
						this.productsLoadError = null;
						this.products = [];
						this.totalPages = 0;
						this.isProductsLoading = true;
						this.selectedProductsIds.clear();
						this.isMovingProducts = false;
						this.movingToSubcategoryId = null;
					}

					const { isValid, queryParams } = validateProductsBrandQueryParams(params);

					if (!isValid) {
						this.router.navigate([], {
							relativeTo: this.route,
							queryParams,
							replaceUrl: true,
						});
						return EMPTY;
					}

					this.id = brandId;
					this.loadQueryParams(queryParams);

					return this.loadProducts$();
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private loadQueryParams(params: GetProductsBrandQPI): void {
		this.filter = params.filter;
		this.currentPage = params.page;
		this.limit = params.limit;
		this.selectedStatus = params.status;
		this.selectedSort = params.sort;
		this.selectedSubcategoryIds = params.subcategoryIds;
		this.selectedCategoryIds = params.categoryIds;
		this.selectedQuality = params.quality;
		this.selectedVisibility = params.visibility;
		this.minPrice = params.minPrice ?? null;
		this.maxPrice = params.maxPrice ?? null;
	}

	private loadProducts$(showSpinner: boolean = true): Observable<void> {
		if (showSpinner) {
			this.isProductsLoading = true;
			this.productsLoadError = null;
			this.products = [];
			this.selectedProductsIds.clear();
			this.totalPages = 0;
		}

		const request$ = this.brandService.findBrandProducts(this.id, {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			subcategoryIds: this.selectedSubcategoryIds,
			categoryIds: this.selectedCategoryIds,
			quality: this.selectedQuality,
			visibility: this.selectedVisibility,
			minPrice: this.minPrice,
			maxPrice: this.maxPrice,
		});

		const productsRequest$ = showSpinner ? request$.pipe(withMinLoadingTime(GLOBAL.MIN_LOADING_TIME)) : request$;

		return productsRequest$.pipe(
			tap((response: FindBrandProductsRESI) => {
				console.log(response);

				this.productsLoadError = null;
				this.brandName = response.brand;
				this.products = response.products.map((product) => ({
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

				this.productsLoadError = getHttpErrorBody(error, 'No fue posible cargar los productos.');

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
		this.initProducts();
	}

	private loadCategories$(): Observable<void> {
		this.isCategoriesLoading = true;
		this.categoriesLoadError = null;

		return this.categoryService.getCategoriesWithSubcategories().pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),

			tap((response: GetCategoriesWithSubcategoriesRESI) => {
				console.log(response);

				this.categories = response.data.map((category) => ({
					...category,
					safeIcon: this.sanitizer.bypassSecurityTrustHtml(category.icon ?? ''),
				}));
			}),

			map(() => void 0),

			catchError((error: HttpErrorResponse) => {
				this.categories = [];

				this.categoriesLoadError = getHttpErrorBody(error, 'No fue posible cargar las categorías.');

				return EMPTY;
			}),

			finalize(() => {
				this.isCategoriesLoading = false;
			})
		);
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
				categoryIds: this.selectedCategoryIds,
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

		this.minPrice = parsedPrice;
	}

	onMaxPriceChange(price: number | null): void {
		if (price === null || price === undefined || price === ('' as any)) {
			this.maxPrice = null;
			return;
		}

		const parsedPrice = Number(price);

		this.maxPrice = parsedPrice;
	}

	onLimitChange() {
		this.applyFilters();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.productsRefresh$.complete();
		this.categoriesRefresh$.complete();
		this.cancelBrandContext$.complete();
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
		this.selectedCategoryIds = 'Todos';
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
				categoryIds: null,
				quality: null,
				visibility: null,
				minPrice: null,
				maxPrice: null,
			},
			queryParamsHandling: 'merge',
		});
	}

	initProducts(): void {
		this.productsRefresh$.next();
	}

	initCategories(): void {
		this.categoriesRefresh$.next();
	}

	applyFilters(resetPage: boolean = true): void {
		if (this.minPrice !== null && (!Number.isFinite(this.minPrice) || this.minPrice < 0)) {
			toastr.error('El precio desde debe ser un número válido mayor o igual a cero.');
			return;
		}
		if (this.maxPrice !== null && (!Number.isFinite(this.maxPrice) || this.maxPrice < 0)) {
			toastr.error('El precio hasta debe ser un número válido mayor o igual a cero.');
			return;
		}
		if (this.minPrice !== null && this.maxPrice !== null && this.minPrice > this.maxPrice) {
			toastr.error('El precio desde no puede superar al precio hasta.');
			return;
		}

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
			categoryIds: this.selectedCategoryIds,
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
			(current['categoryIds'] ?? 'Todos') === this.selectedCategoryIds &&
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

	hasSelectedProducts(): boolean {
		return this.selectedProductsIds.size > 0;
	}

	moveSelectedProductsTo(category: CategoryWithSubcategoriesRESI, subcategory: MappingSubcategoryInterface): void {
		if (this.isProductsLoading || this.productsLoadError || this.isMovingProducts || this.isCategoriesLoading || this.categoriesLoadError) return;
		if (this.selectedProductsIds.size === 0) {
			toastr.error('Debes seleccionar al menos un producto.');
			return;
		}
		const version = this.contextVersion;
		const brandId = this.id;
		const isCurrentContext = () => version === this.contextVersion && brandId === this.id;

		const payload: MoveProductsInterface = {
			categoryId: category.id!,
			subcategoryId: subcategory.id!,
			products: [...this.selectedProductsIds],
		};

		this.isMovingProducts = true;
		this.movingToSubcategoryId = subcategory.id!;

		this.categoryService
			.moveProductsToSubcategory(payload)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.cancelBrandContext$),
				takeUntil(this.destroy$),
				finalize(() => {
					if (!isCurrentContext()) return;
					this.isMovingProducts = false;
					this.movingToSubcategoryId = null;
				})
			)
			.subscribe({
				next: (response: MoveProductsToSubcategoryRESI) => {
					if (!isCurrentContext()) return;
					this.selectedProductsIds.clear();
					this.refreshProducts();

					toastr.success(response.message);
				},

				error: (error: HttpErrorResponse) => {
					if (!isCurrentContext()) return;
					toastr.error(getHttpErrorBody(error, 'No fue posible mover los productos.').message);
				},
			});
	}

	onProductSelectionChange(id: string, event: Event) {
		if (this.isProductsLoading || this.productsLoadError || this.isMovingProducts || !this.products.some((product) => product.id === id)) return;
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			this.selectedProductsIds.add(id);
		} else {
			this.selectedProductsIds.delete(id);
		}
	}

	selectProductForMove(id: string): void {
		if (this.isProductsLoading || this.productsLoadError || this.isMovingProducts || !this.products.some((product) => product.id === id)) return;
		this.selectedProductsIds.clear();
		this.selectedProductsIds.add(id);
	}
}
