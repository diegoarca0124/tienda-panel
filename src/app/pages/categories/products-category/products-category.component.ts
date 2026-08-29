import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CategoryService } from '@app/services/category.service';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { EMPTY, finalize, forkJoin, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { ProductInterface } from '@app/pages/products/interfaces/product.interface';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { ValidateQPProductsCategory } from '../utils/validate-qp-products-category.util';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuSubcategoriesComponent } from '@app/shared/menu-subcategories/menu-subcategories.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { createEmptyCategory, createMoveProducts } from '../utils/empties.util';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from '../../../common/pipes/pad-code.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationMetaInterface } from '@app/common/interface/pagination-meta.interface';
import { sortProductsFilters } from '../constants/sort-products-filters.constant';
import { CurrencySymbolPipe } from '../../../common/pipes/currency-symbol.pipe';
import { qualityFilters } from '../constants/quality-filters.constant';
import { visibilityFilters } from '../constants/visibility.filters.constant';
import { InputDialerComponent } from '@app/shared/input-dialer/input-dialer.component';
import { CategoryInterface, MoveProductsInterface } from '../interfaces/data.interface';
import { GetCategoriesWithSubcategoriesRESI } from '../interfaces/response.interface';
declare var toastr: any;

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

	public categoryLoadError: string = '';
	public categoriesLoadError: string = '';
	public productsLoadError: string = '';

	public readonly statusFilters = [];
	public readonly qualityFilters = qualityFilters;
	public readonly visibilityFilters = visibilityFilters;
	public readonly sortFilters = sortProductsFilters;
	public readonly sortValues = sortProductsFilters.map((item) => item.value);

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
		this.route.params
			.pipe(
				takeUntil(this.destroy$),
				switchMap((params) => {
					this.id = params['id'];
					this.isCategoryLoading = true;

					return this.categoryService.get_category(this.id).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						finalize(() => (this.isCategoryLoading = false)),
						switchMap((category) =>
							this.route.queryParams.pipe(
								map((queryParams) => ({
									category,
									queryParams,
								}))
							)
						)
					);
				}),
				switchMap(({ category, queryParams }) => {
					this.category = category.data;
					if (!ValidateQPProductsCategory(this.route, queryParams, this.router, this.sortValues)) return EMPTY;

					this.applyQueryParams(queryParams);

					return forkJoin({
						products: this.initProducts$(
							this.filter,
							this.currentPage,
							this.limit,
							this.selectedStatus,
							this.selectedSort,
							this.selectedSubcategoryIds,
							this.selectedQuality,
							this.selectedVisibility,
							this.minPrice,
							this.maxPrice
						),
						categories: this.initCategories$(),
					});
				})
			)
			.subscribe({
				error: (err: HttpErrorResponse) => {
					this.isProductsLoading = false;
					this.categoryLoadError = err.error;
				},
			});
	}

	private applyQueryParams(params: Params): void {
		this.filter = params['filter'] || '';
		this.currentPage = Number(params['page']) || 1;
		this.selectedStatus = params['status'] || 'Todos';
		this.limit = Number(params['limit']) || 10;
		this.selectedSort = params['sort'] || 'Predeterminado';
		this.selectedSubcategoryIds = params['subcategoryIds'] || 'Todos';
		this.selectedQuality = params['quality'] || 'Todos';
		this.selectedVisibility = params['visibility'] || 'Todos';
		this.minPrice = params['minPrice'] ? Number(params['minPrice']) : null;
		this.maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : null;
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

	initProducts$(
		filter: string,
		page: number,
		limit: number,
		status: string,
		sort: string,
		subcategoryIds: string,
		quality: string,
		visibility: string,
		minPrice: number,
		maxPrice: number
	) {
		this.isProductsLoading = true;
		this.products = [];
		this.totalPages = 1;
		this.productsLoadError = '';

		return this.categoryService
			.findCategoryProducts(this.id, {
				filter,
				page,
				limit,
				status,
				sort,
				subcategoryIds,
				quality,
				visibility,
				minPrice,
				maxPrice,
			})
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isProductsLoading = false)),
				tap({
					next: (next: { products: ProductInterface[]; meta: PaginationMetaInterface }) => {
						console.log(next);

						this.products = next.products.map((product) => ({
							...product,
							cover: `${environment.s3_public_url}/products/small/${product.cover}`,
							brand: {
								...product.brand,
								logoUrl: `${environment.s3_public_url}/brands/small/${product.brand.logoUrl}`,
							},
						}));

						this.currentPage = next.meta.currentPage;
						this.totalPages = next.meta.totalPages;
					},
					error: (err: HttpErrorResponse) => {
						this.productsLoadError = err.error;
					},
				})
			);
	}

	initCategories$() {
		this.isCategoriesLoading = true;
		this.categoriesLoadError = '';

		return this.categoryService.getCategoriesWithSubcategories().pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.isCategoriesLoading = false)),
			tap({
				next: (next: GetCategoriesWithSubcategoriesRESI) => {
					this.categories = next.data.map((category) => ({
						...category,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(category.icon),
					}));
				},
				error: (err: HttpErrorResponse) => {
					this.categoriesLoadError = err.error;
				},
			})
		);
	}

	initCategories() {
		this.initCategories$().pipe(takeUntil(this.destroy$)).subscribe();
	}

	initProducts() {
		this.initProducts$(
			this.filter,
			this.currentPage,
			this.limit,
			this.selectedStatus,
			this.selectedSort,
			this.selectedSubcategoryIds,
			this.selectedQuality,
			this.selectedVisibility,
			this.minPrice,
			this.maxPrice
		)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	initCategoriesNoload$() {
		this.categoriesLoadError = '';
		this.selectedSubcategoryIds = 'Todos';
		this.currentPage = 1;
		this.limit = 10;
		this.selectedStatus = 'Todos';
		return this.categoryService.getCategoriesWithSubcategories().pipe(
			tap({
				next: (next: GetCategoriesWithSubcategoriesRESI) => {
					console.log(next);
					this.categories = next.data;
					this.categories = next.data.map((i) => ({
						...i,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(i.icon),
					}));
					this.initProducts();
				},
				error: (err: HttpErrorResponse) => {
					console.log(err);

					const error = err.error;
					this.categoriesLoadError = error;
				},
			})
		);
	}

	initCategoriesNoload() {
		this.initCategoriesNoload$().pipe(takeUntil(this.destroy$)).subscribe();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	setLimit() {
		this.currentPage = 1;
		this.applyFilters();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.applyFilters(); // o init_collaborators()
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

		this.selectedProductsIds.clear();

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
		});
	}

	applyFilters() {
		this.selectedProductsIds.clear();

		const queryParams = {
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			filter: this.filter,
			sort: this.selectedSort,
			subcategoryIds: this.selectedSubcategoryIds,
			quality: this.selectedQuality,
			visibility: this.selectedVisibility,
			minPrice: this.minPrice,
			maxPrice: this.maxPrice,
		};

		const current: any = this.route.snapshot.queryParams;

		const same =
			Number(current.page) === queryParams.page &&
			Number(current.limit) === queryParams.limit &&
			(current.filter ?? '') === queryParams.filter &&
			(current.status ?? 'Todos') === queryParams.status &&
			(current.sort ?? 'Predeterminado') === queryParams.sort &&
			(current.subcategoryIds ?? 'Todos') === queryParams.subcategoryIds &&
			(current.visibility ?? 'Todos') === queryParams.visibility &&
			(current.minPrice ?? 'Todos') === queryParams.minPrice &&
			(current.maxPrice ?? 'Todos') === queryParams.maxPrice;
		if (same) {
			this.initProducts();
			return;
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams,
			queryParamsHandling: '',
		});
	}

	onSubcategoriesChange(subcategories: any) {
		if (subcategories.length >= 1) {
			this.selectedSubcategoryIds = subcategories.join(',');
		} else {
			this.selectedSubcategoryIds = 'Todos';
		}
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
				.update_catsubcat_products(this.moveProductsPayload)
				.pipe(
					takeUntil(this.destroy$),
					finalize(() => {
						this.isMovingProducts = false;
						this.movingToSubcategoryId = null;
					})
				)
				.subscribe({
					next: (next: { data: any; message: string }) => {
						this.selectedProductsIds.clear();
						this.initCategoriesNoload();
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
