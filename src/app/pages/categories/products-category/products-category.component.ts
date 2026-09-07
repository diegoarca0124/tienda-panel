import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CategoryService } from '@app/services/category.service';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { catchError, combineLatest, concatMap, EMPTY, finalize, forkJoin, map, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { ProductInterface } from '@app/pages/products/interfaces/product.interface';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { validateProductsCategoryQueryParams } from '../utils/validate-productscategory-query-params..util';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuSubcategoriesComponent } from '@app/shared/menu-subcategories/menu-subcategories.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { createEmptyCategory, createMoveProducts } from '../utils/empties.util';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from '../../../common/pipes/pad-code.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationMetaInterface } from '@app/common/interface/pagination-meta.interface';
import { CurrencySymbolPipe } from '../../../common/pipes/currency-symbol.pipe';
import { InputDialerComponent } from '@app/shared/input-dialer/input-dialer.component';
import { CategoryInterface, MoveProductsInterface } from '../interfaces/data.interface';
import { FindCategoryProductsRESI, GetCategoriesWithSubcategoriesRESI, MoveSubcategoryRESI } from '../interfaces/response.interface';
import { qualityOptions, sortOptions, statusOptions, visibilityOptions } from '@app/pages/products/constants/selectors.constant';
import { GetProductsCategoryQPI } from '../interfaces/query-params.interface';
declare var toastr: any;

type ProductsCategoryLoadResult = { data: any; error: null } | { data: null; error: HttpErrorResponse };

@Component({
	selector: 'app-products-category',
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
	templateUrl: './products-category.component.html',
	styleUrl: './products-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsCategoryComponent {
	private destroy$ = new Subject<void>();

	public id: string = '';

	public category: CategoryInterface = createEmptyCategory();
	public categories: CategoryInterface[] = [];
	public products: ProductInterface[] = [];

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedQuality: string = 'Todos';
	public selectedVisibility: string = 'Todos';
	public selectedSort: string = 'Predeterminado';
	public selectedSubcategoryIds: string = 'Todos';
	public minPrice: any = null;
	public maxPrice: any = null;

	public currentPage: number = 1;
	public totalPages: number = 0;
	public limit: number = 10;

	public selectedProductsIds = new Set<string>();

	public moveProductsPayload: MoveProductsInterface = createMoveProducts();
	public movingToSubcategoryId: string | null = null;

	public expandedCategoryIndex: number | null = 0;

	public isCategoryLoading: boolean = true;
	public isCategoriesLoading: boolean = false;
	public isProductsLoading: boolean = true;
	public isMovingProducts: boolean = false;

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
		private categoryService: CategoryService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
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
					const validParams = validateProductsCategoryQueryParams(this.route, queryParams, this.router, this.sortValues);
					if (!validParams) return EMPTY;
					this.id = categoryId;
					this.loadQueryParams(queryParams);
					return this.loadProducts$().pipe(concatMap(() => this.loadCategories$()));
				}),
				takeUntil(this.destroy$)
			)
			.subscribe();
	}

	private loadQueryParams(params: Params): void {
		this.filter = params['filter'] || '';
		this.currentPage = Number(params['page']);
		this.limit = Number(params['limit']);
		this.selectedStatus = params['status'];
		this.selectedSort = params['sort'];
		this.selectedSubcategoryIds = params['subcategoryIds'] || 'Todos';
		this.selectedQuality = params['quality'] || 'Todos';
		this.selectedVisibility = params['visibility'] || 'Todos';
		this.minPrice = params['minPrice'] ? Number(params['minPrice']) : null;
		this.maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : null;
	}

	private loadProducts$(showSpinner: boolean = true): Observable<void> {
		if (showSpinner) {
			this.isProductsLoading = true;
			this.productsLoadError = null;
			this.products = [];
		}

		const request$ = this.categoryService.findCategoryProducts(this.id, {
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
			tap((response: FindCategoryProductsRESI) => {
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
				this.productsLoadError = error.error;

				if (showSpinner) {
					this.products = [];
					this.totalPages = 0;
				}

				return EMPTY;
			}),

			finalize(() => {
				if (showSpinner) {
					this.isProductsLoading = false;
				}
			})
		);
	}

	refreshProducts(): void {
		this.loadProducts$(false)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				error: () => {
					toastr.error('Los productos se movieron, pero no fue posible actualizar la tabla.');
				},
			});
	}

	private loadCategories$(): Observable<void> {
		this.isCategoriesLoading = true;
		this.categoriesLoadError = null;

		return this.categoryService.getCategoriesWithSubcategories().pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			tap((response: GetCategoriesWithSubcategoriesRESI) => {
				this.categories = response.data.map((category) => ({
					...category,
					safeIcon: this.sanitizer.bypassSecurityTrustHtml(category.icon),
				}));
			}),
			map(() => void 0),
			catchError((error: HttpErrorResponse) => {
				this.categoriesLoadError = error.error;
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
				quality: this.selectedQuality,
				visibility: this.selectedVisibility,
				minPrice: this.minPrice,
				maxPrice: this.maxPrice,
			},
			replaceUrl: true,
		});
	}

	onMinPriceChange(price: any) {
		if (price != null) {
			this.minPrice = parseFloat(price);
		} else {
			this.minPrice = '';
		}
	}

	onMaxPriceChange(price: any) {
		if (price != null) {
			this.maxPrice = parseFloat(price);
		} else {
			this.maxPrice = '';
		}
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
		this.selectedSort = 'Todos';
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

	initCategories(): void {
		this.loadCategories$().pipe(takeUntil(this.destroy$)).subscribe();
	}

	applyFilters(resetPage: boolean = true) {
		if (resetPage) this.currentPage = 1;

		const normalizedFilter = typeof this.filter === 'string' ? this.filter.trim().slice(0, 50) : '';
		this.filter = normalizedFilter;
		const queryParams = {
			filter: normalizedFilter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			subcategoryIds: this.selectedSubcategoryIds,
			quality: this.selectedQuality,
			visibility: this.selectedVisibility,
			minPrice: this.minPrice,
			maxPrice: this.maxPrice,
		};

		const current = this.route.snapshot.queryParams;

		const same =
			(current['filter'] ?? '') === queryParams.filter &&
			Number(current['page'] ?? 1) === queryParams.page &&
			Number(current['limit'] ?? 10) === queryParams.limit &&
			(current['status'] ?? 'Todos') === queryParams.status &&
			(current['sort'] ?? 'Predeterminado') === queryParams.sort &&
			(current['subcategoryIds'] ?? 'Todos') === queryParams.subcategoryIds &&
			(current['quality'] ?? 'Todos') === queryParams.quality &&
			(current['visibility'] ?? 'Todos') === queryParams.visibility &&
			(current['minPrice'] ?? 'Todos') === queryParams.minPrice &&
			(current['maxPrice'] ?? 'Todos') === queryParams.maxPrice;

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

	moveSelectedProductsTo(item: any, item_: any) {
		if ([...this.selectedProductsIds].length >= 1) {
			this.moveProductsPayload.categoryId = item.id;
			this.moveProductsPayload.subcategoryId = item_.id;
			this.moveProductsPayload.products = [...this.selectedProductsIds];
			this.isMovingProducts = true;
			this.movingToSubcategoryId = item_.id;
			this.categoryService
				.moveProductsToSubcategory(this.moveProductsPayload)
				.pipe(
					takeUntil(this.destroy$),
					finalize(() => {
						this.isMovingProducts = false;
						this.movingToSubcategoryId = null;
					})
				)
				.subscribe({
					next: (next: MoveSubcategoryRESI) => {
						this.selectedProductsIds.clear();
						this.refreshProducts();
						toastr.success(next.message);
					},
					error: (err: HttpErrorResponse) => {
						console.log(err);
						const error = err.error;
						toastr.error(error.message || '¡Error desconocido!');
					},
				});
		} else {
			toastr.error('Debes seleccionar productos.');
		}
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
