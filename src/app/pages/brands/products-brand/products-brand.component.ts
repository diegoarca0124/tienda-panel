import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { statusProducts } from '@app/common/constants/statusProducts.contant';
import { ProductInterface } from '@app/pages/products/interfaces/product.interface';
import { BrandService } from '@app/services/brand.service';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { combineLatest, EMPTY, filter, finalize, forkJoin, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ValidateQPProductsBrand } from '../utils/validate-qp-products-brand.util';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { BrandInterface } from '../interfaces/brand.interface';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from "../../../common/pipes/pad-code.pipe";
import { createEmptyBrand } from '../utils/empties.util';
import { HttpErrorResponse } from '@angular/common/http';
import { CurrencySymbolPipe } from "../../../common/pipes/currency-symbol.pipe";
import { sortColumnsProducts } from '../constants/sort-columns-products.constant';
import { PaginationMetaInterface } from '@app/common/interface/pagination-meta.interface';
import { CategoryService } from '@app/services/category.service';
import { CategoryInterface } from '@app/pages/categories/interfaces/category.interface';

@Component({
  selector: 'app-products-brand',
  imports: [
    TopbarComponent,
    SidebarComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ModalDeleteComponent,
    PaginationComponent,
    NotFoundComponent,
    NgSelectModule,
    NgbTooltipModule,
    FallbackImageDirective,
    PadCodePipe,
    CurrencySymbolPipe,
],
  templateUrl: './products-brand.component.html',
  styleUrl: './products-brand.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductsBrandComponent {

  private destroy$ = new Subject<void>();
  public filter: string = '';
	public status: string = 'Todos';
	public currentPage: number = 1;
  public sort: string = 'Predeterminado';
  public totalPages: number = 0;
	public limit: number = 10;
  public id : string = '';
  public loading : boolean = true;
  public loadBrand : boolean = true;
  public subcategoryIds : string = "";
  public brand: BrandInterface = createEmptyBrand();
  public errorMsmServerListProducts : string = '';
  public errorMsmServerBrand : string = '';
  public products : ProductInterface[] = [];
  public selectedIds : string[] = [];
  public statusTable = statusProducts;
  public sortColumns = sortColumnsProducts;
  public selectedProductsIds = new Set<string>();
  public errorMsmServerCategory : string = '';
  public readonly sortValues = sortColumnsProducts.map(item => item.value);

  readonly qualityLabels: Record<string, string> = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta',
	};

 
  constructor(
    private _router: Router,
		private brandService: BrandService,
		private _route: ActivatedRoute,
		private sanitizer: DomSanitizer,
    private categoryService: CategoryService
  ){

  }

  ngOnInit() {
    this._route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.id = params['id'];
        this.loadBrand = true;

        return this.brandService.get_brand(this.id).pipe(
          withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
          finalize(() => (this.loadBrand = false)),
          switchMap(brand =>
            this._route.queryParams.pipe(
              map(queryParams => ({
                brand,
                queryParams,
              }))
            )
          )
        );
      }),
      switchMap(({ brand, queryParams }) => {
        this.brand = brand.data;
        if (typeof this.brand.logoUrl === 'string' && this.brand.logoUrl.length > 0 && !this.brand.logoUrl.startsWith('http')) {
          this.brand.logoUrl = `${environment.s3_public_url}/brands/small/${this.brand.logoUrl}`;
        }
        if (
          !ValidateQPProductsBrand(
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
            this.subcategoryIds
          ),
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

  initProducts$(filter: string,page: number,limit: number,status: string,sort: string,subcategoryIds: string) {
    this.loading = true;
    this.products = [];
    this.totalPages = 1;
    this.errorMsmServerListProducts = '';

    return this.brandService
      .get_product_by_brand(this.id, {
        filter,
        page,
        limit,
        status,
        sort,
        subcategoryIds,
      })
      .pipe(
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loading = false)),
        tap({
          next: (next: {
            products: ProductInterface[];
            meta: PaginationMetaInterface;
          }) => {
            this.products = this.mapProducts(next.products);
            this.currentPage = next.meta.currentPage;
            this.totalPages = next.meta.totalPages;
          },
          error: (err: HttpErrorResponse) => {
            this.errorMsmServerListProducts = err.error;
          },
        })
      );
  }

  initProducts(){
    this.initProducts$(this.filter,this.currentPage,this.limit,this.status,this.sort,this.subcategoryIds)
    .pipe(takeUntil(this.destroy$))
    .subscribe();
  }

  private loadQueryParams(params: Params): void {
    this.filter = params['filter'] || '';
    this.currentPage = Number(params['page']) || 1;
    this.status = params['status'] || 'Todos';
    this.limit = Number(params['limit']) || 10;
    this.sort = params['sort'] || 'Predeterminado';
    this.subcategoryIds = params['subcategoryIds'] || 'Todos';
  }

  private mapProducts(products: ProductInterface[]): ProductInterface[] {
		return products.map(product => ({
			...product,
      cover : `${environment.s3_public_url}/products/small/${product.cover}`,
      brand: {
          ...product.brand,
          logoUrl: `${environment.s3_public_url}/brands/small/${product.brand.logoUrl}`
      }
		}));
	}

  getSubategories(subcategories: any){
		if(subcategories.length >= 1){
      this.subcategoryIds = subcategories.join(',');
    }else{
      this.subcategoryIds = 'Todos';
    }
	}

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

  redirect() {
    const queryParams = {
      page: this.currentPage,
      limit: this.limit,
      status: this.status,
      filter: this.filter,
      sort: this.sort,
      subcategoryIds: this.subcategoryIds,
    };

    const current: any = this._route.snapshot.queryParams;

    const same =
      Number(current.page) === queryParams.page &&
      Number(current.limit) === queryParams.limit &&
      (current.filter ?? '') === queryParams.filter &&
      (current.status ?? 'Todos') === queryParams.status &&
      (current.sort ?? 'Predeterminado') === queryParams.sort &&
      (current.subcategoryIds ?? 'Todos') === queryParams.subcategoryIds;

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

   resetFilters(){
		this.filter = '';
		this.status = 'Todos';
		this.currentPage = 1;
		this.limit = 10;
    this.sort = 'Todos';
    this.subcategoryIds = 'Todos';

		this._router.navigate([], {
      queryParams: {
        page: 1,
        limit: 10,
        filter: null,
        status: null,
        sort: null,
        subcategoryIds: null,
      },
      queryParamsHandling: 'merge',
    });
	}

  hasSelectedProducts(): boolean {
      return this.selectedProductsIds.size > 0;
  }

  toggleItem(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			this.selectedProductsIds.add(id);
		} else {
			this.selectedProductsIds.delete(id);
		}
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
