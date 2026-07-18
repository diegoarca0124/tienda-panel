import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { CategoryService } from '@app/services/category.service';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { combineLatest, distinctUntilChanged, EMPTY, filter, finalize, forkJoin, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { sortColumnsCategories } from '../constants/sort-columns-categories.constant';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { ProductInterface } from '@app/pages/products/interfaces/product.interface';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { ValidateQPProductsCategory } from '../utils/validate-qp-products-category.util';
import { statusTable } from '@app/common/constants/statusTable.contant';
import { NgSelectModule } from '@ng-select/ng-select';
import { statusProducts } from '../interfaces/status-produtcs.interface';
import { MenuSelectSubcategoriesComponent } from '@app/shared/menu-select-subcategories/menu-select-subcategories.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { UpdatesCatsubcatProductsInterface } from '../interfaces/update-catsubcat.products.interface';
import { createEmptyCategory, createUpdateCatsubcatProducts } from '../utils/empties.util';
import { FallbackImageDirective } from "@app/common/directives/fallback-image.directive";
import { environment } from 'environments/environment.dev';
import { CategoryInterface } from '../interfaces/category.interface';
import { PadCodePipe } from "../../../common/pipes/pad-code.pipe";
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationMetaInterface } from '@app/common/interface/pagination-meta.interface';
import { sortColumnsProducts } from '../constants/sort-columns-products.constant';
import { CurrencySymbolPipe } from "../../../common/pipes/currency-symbol.pipe";
import { qualityFilters } from '../constants/quality-filters.constant';
import { statusFilters } from '../constants/status-filters.constant';
import { visibilityFilters } from '../constants/visibility.filters.constant';
import { InputDialerComponent } from '@app/shared/input-dialer/input-dialer.component';
declare var toastr:any;

@Component({
  selector: 'app-products-category',
  imports: [
    CommonModule,
    TopbarComponent,
    SidebarComponent,
    RouterModule,
    AlertComponent,
    FormsModule,
    PaginationComponent,
    NgSelectModule,
    MenuSelectSubcategoriesComponent,
    NotFoundComponent,
    FallbackImageDirective,
    PadCodePipe,
    CurrencySymbolPipe,
    InputDialerComponent
],
  templateUrl: './products-category.component.html',
  styleUrl: './products-category.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductsCategoryComponent {

  private destroy$ = new Subject<void>();
  public filter: string = '';
	public status: string = 'Todos';
  public quality: string = 'Todos';
  public visibility: string = 'Todos';
  public minPrice : any = null;
  public maxPrice : any = null;
	public currentPage: number = 1;
  public totalPages: number = 0;
  public loadCategory : boolean = true;
	public limit: number = 10;
  public sort: string = 'Predeterminado';
  public id : string = '';
  public subcategoryIds : string = "";
  public loading : boolean = true;
  public errorMsmServerListProducts : string = '';
  public errorMsmServerCategory : string = '';
  public products : ProductInterface[] = [];
  public selectedIds : string[] = [];
  public statusFilters = statusFilters;
  public qualityFilters = qualityFilters;
  public visibilityFilters = visibilityFilters;
  public sortFilters = sortColumnsProducts;
  public subcategories: string = '';
  public categories: CategoryInterface[] = [];
  public data : UpdatesCatsubcatProductsInterface = createUpdateCatsubcatProducts();
  public selectedProductsIds = new Set<string>();
  public loadCategories : boolean = false;
  public errorMsmServerGetSubcategory : string = '';
  public errorMsmServerGetCategory : string = '';
  public errorMsmServer : string = '';
  public categoryName : string = '';
  public openedCategory: number | null = 0;
  public subcategoryDestination : string | null = null;
  public loadingMove : boolean = false;
  public category: CategoryInterface = createEmptyCategory();
  public readonly sortValues = sortColumnsProducts.map(item => item.value);

  readonly qualityLabels: Record<string, string> = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta',
	};

  constructor(
    private _router: Router,
		private categoryService: CategoryService,
		private _route: ActivatedRoute,
		private sanitizer: DomSanitizer
  ){

  }

  ngOnInit() {
    this._route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap(params => {
          this.id = params['id'];
          this.loadCategory = true;

          return this.categoryService.get_category(this.id).pipe(
            withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
            finalize(() => (this.loadCategory = false)),
            switchMap(category =>
              this._route.queryParams.pipe(
                map(queryParams => ({
                  category,
                  queryParams,
                }))
              )
            )
          );
        }),
        switchMap(({ category, queryParams }) => {
          this.category = category.data;

          if (
            !ValidateQPProductsCategory(
              this._route,
              queryParams,
              this._router,
              this.sortValues
            )
          ) {
            return EMPTY;
          }

          this.loadQueryParams(queryParams);

          return forkJoin({
            products: this.initProducts$(
              this.filter,
              this.currentPage,
              this.limit,
              this.status,
              this.sort,
              this.subcategoryIds,
              this.quality,
              this.visibility,
              this.minPrice,
              this.maxPrice,
            ),
            categories: this.initCategories$(),
          });
        })
      )
      .subscribe({
        error: (err: HttpErrorResponse) => {
          this.loading = false;
          this.errorMsmServerCategory = err.error;
        },
      });
  }

  private loadQueryParams(params: Params): void {
		this.filter = params['filter'] || '';
    this.currentPage = Number(params['page']) || 1;
    this.status = params['status'] || 'Todos';
    this.limit = Number(params['limit']) || 10;
    this.sort = params['sort'] || 'Predeterminado';
    this.subcategoryIds = params['subcategoryIds'] || 'Todos';
    this.quality = params['quality'] || 'Todos';
    this.visibility = params['visibility'] || 'Todos';
    this.minPrice = params['minPrice'] ? Number(params['minPrice']) : null;
    this.maxPrice = params['maxPrice'] ? Number(params['maxPrice']) : null;
	}

  getMinPrice(price: any){
    if(price != null){
      this.minPrice = parseFloat(price);
    }else{
      this.minPrice = '';
    }
  }

  getMaxPrice(price: any){
    if(price != null){
      this.maxPrice = parseFloat(price);
    }else{
      this.maxPrice = '';
    }
  }

  initProducts$(filter: string,page: number,limit: number,status: string,sort: string,subcategoryIds: string, quality: string, visibility: string, minPrice: number, maxPrice: number) {
    this.loading = true;
    this.products = [];
    this.totalPages = 1;
    this.errorMsmServerListProducts = '';

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
        maxPrice
      })
      .pipe(
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loading = false)),
        tap({
          next: (next: {
            products: ProductInterface[];
            meta: PaginationMetaInterface;
          }) => {
            console.log(next);
            
            this.products = next.products.map(product => ({
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
            this.errorMsmServerListProducts = err.error;
          },
        })
      );
  }

  initCategories$() {
    this.loadCategories = true;
    this.errorMsmServerGetCategory = '';

    return this.categoryService
      .get_categories_with_subcategories()
      .pipe(
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loadCategories = false)),
        tap({
          next: (next: {
            data: CategoryInterface[];
            message: string;
          }) => {
            this.categories = next.data.map(category => ({
              ...category,
              safeIcon: this.sanitizer.bypassSecurityTrustHtml(category.icon),
            }));
          },
          error: (err: HttpErrorResponse) => {
            this.errorMsmServerGetCategory = err.error;
          },
        })
      );
  }
  
  initCategories(){
    this.initCategories$()
    .pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  initProducts(){
    this.initProducts$(this.filter,this.currentPage,this.limit,this.status,this.sort,this.subcategoryIds, this.quality, this.visibility, this.minPrice, this.maxPrice)
    .pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  init_categories_noload$(){
    this.errorMsmServerGetCategory = '';
    this.subcategoryIds = 'Todos';
    this.currentPage = 1;
    this.limit = 10;
    this.status = 'Todos';
    return this.categoryService.get_categories_with_subcategories().pipe(
      tap({
        next: (next: { data: CategoryInterface[], message: string}) => {
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
          this.errorMsmServerGetCategory = error;
        },
      })
    );
  }

  init_categories_noload(){
    this.init_categories_noload$()
    .pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  setLimit() {
		this.currentPage = 1;
		this.redirect();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.redirect(); // o init_collaborators()
	}

  resetFilters(){
		this.filter = '';
		this.status = 'Todos';
		this.currentPage = 1;
		this.limit = 10;
    this.sort = 'Todos';
    this.subcategoryIds = 'Todos';
    this.quality = 'Todos';
    this.visibility = 'Todos';
    this.minPrice = null;
    this.maxPrice = null;

		this._router.navigate([], {
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
        maxPrice: null
      },
    });
	}

  redirect() {
    const queryParams = {
      page: this.currentPage,
      limit: this.limit,
      status: this.status,
      filter: this.filter,
      sort: this.sort,
      subcategoryIds: this.subcategoryIds,
      quality: this.quality,
      visibility: this.visibility,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
    };

    const current: any = this._route.snapshot.queryParams;

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

    this._router.navigate([], {
      relativeTo: this._route,
      queryParams,
      queryParamsHandling: '',
    });
  }

  getSubategories(subcategories: any){
		if(subcategories.length >= 1){
      this.subcategoryIds = subcategories.join(',');
    }else{
      this.subcategoryIds = 'Todos';
    }
	}

  toggleCategory(index: number) {
    this.openedCategory = this.openedCategory === index ? null : index;
  }

  hasSelectedProducts(): boolean {
      return this.selectedProductsIds.size > 0;
  }

  selectSubcategory(item: any, item_:any){
    if([...this.selectedProductsIds].length >= 1){
      this.data.categoryId = item.id;
      this.data.subcategoryId = item_.id;
      this.data.products = [...this.selectedProductsIds];
      this.loadingMove = true;
      this.subcategoryDestination = item_.id;
      this.categoryService.update_catsubcat_products(this.data)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loadingMove = false;
          this.subcategoryDestination = null;
        })
      )
      .subscribe({
          next: (next: { data: any, message: string}) => {
            console.log(next);
            
            this.init_categories_noload();
            toastr.success(next.message);
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
            const error = err.error;
            this.errorMsmServer = error.message || '¡Error desconocido!';
            toastr.error(this.errorMsmServer);
          },
        });
    }else{
      toastr.error("Debes seleccionar productos.");
    }
  }

  toggleItem(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			this.selectedProductsIds.add(id);
		} else {
			this.selectedProductsIds.delete(id);
		}
	}


  
}
