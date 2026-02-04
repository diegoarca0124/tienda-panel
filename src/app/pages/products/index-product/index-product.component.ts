import { CommonModule } from '@angular/common';
import { Component, ElementRef, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
import { statusProducts } from '@app/common/constants/statusProducts.contant';
import { statusTable } from '@app/common/constants/statusTable.contant';
import { visibilityProducts } from '@app/common/constants/visibilityProducts.constant';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { sortColumnsTable } from '@app/common/utils/sort-columns-table.util';
import { ValidateQueryParams } from '@app/common/utils/validate-query-params.util';
import { GLOBAL } from '@app/services/GLOBAL';
import { ProductService } from '@app/services/product.service';
import { InputDialerComponent } from '@app/shared/input-dialer/input-dialer.component';
import { InputRangePricesComponent } from '@app/shared/input-range-prices/input-range-prices.component';
import { MenuSelectBrandsComponent } from '@app/shared/menu-select-brands/menu-select-brands.component';
import { MenuSelectCategoriesComponent } from '@app/shared/menu-select-categories/menu-select-categories.component';
import { MenuSelectCountriesComponent } from '@app/shared/menu-select-countries/menu-select-countries.component';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { filter, finalize, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-index-product',
  imports: [TopbarComponent, SidebarComponent, RouterModule, CommonModule, FormsModule, NgSelectModule, ModalDeleteComponent, NotFoundComponent, MenuSelectCategoriesComponent, MenuSelectBrandsComponent, MenuSelectCountriesComponent, InputDialerComponent],
  templateUrl: './index-product.component.html',
  styleUrl: './index-product.component.css'
})
export class IndexProductComponent {

  public loadBtnDelete: WritableSignal<boolean> = signal(false);
  private destroy$ = new Subject<void>();
  public filter: string = '';
	public status: string = 'Todos';
  public visibility: string = 'Todos';
  public minPrice : any = null;
  public maxPrice : any = null;
	public currentPage: number = 1;
	public limit: number = 10;
	public totalPages: number = 0;
	public loading: boolean = true;

  public categories: any = '';
	public categoriesSelected: any = [];
  public errorMsmServerListProducts: string = '';
  public products: any[] = [];
  public statusTable = statusProducts;
  public visibilityTable = visibilityProducts;

  public brands: any = '';
	public brandsSelected: any = [];

  public countries: any = '';
	public countriesSelected: any = [];

  public columns = [
		{ key: 'name', label: 'Producto', classCol: 'col-w-xs-200 col-w-md-250' },
    { key: 'brand', label: 'Marca', classCol: 'col-w-xs-100 col-w-md-150' },
    { key: 'priceRegular', label: 'Precio', classCol: 'col-w-xs-100' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-100' },
	];
  public pageLimit = pageLimit;
  public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));

  constructor(
    private productService: ProductService,
    private _router: Router,
		private _route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {
    
    this.visibilityTable = this.visibilityTable.map((v:any) => ({
			...v,
			icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
		}));
  }

  ngOnInit(): void {
    this._route.queryParams
    .pipe(
      takeUntil(this.destroy$),
      filter((params) => ValidateQueryParams(this._route, params, this._router))
    )
    .subscribe((params) => {
      // ✅ Prepara parámetros con fallback
      const queryCategory = params['categories'] ?? 'Todos';
      const queryBrands = params['brands'] ?? 'Todos';
      const queryCountries = params['countries'] ?? 'Todos';
      this.filter = params['filter'] || '';
      this.currentPage = Number(params['page']) || 1;
      this.limit = Number(params['limit']) || 10;
      this.status = params['status'] ?? '';
      this.visibility = params['visibility'] ?? '';
      this.minPrice = params['minPrice'] ?? '';
      this.maxPrice = params['maxPrice'] ?? '';
      

      let shouldNavigate = false;
      const newQueryParams = { ...params };

      // ✅ Categories
      if (this.categories !== queryCategory) {
        this.categories = queryCategory;
        newQueryParams['categories'] = this.categories;
        shouldNavigate = true;
      } else {
        this.categories = queryCategory;
      }

      // ✅ Brands (MISMA lógica)
      if (this.brands !== queryBrands) {
        console.log(1);
        
        this.brands = queryBrands;
        newQueryParams['brands'] = this.brands;
        shouldNavigate = true;
      } else {
         console.log(2);
        this.brands = queryBrands;
      }

      if (this.countries !== queryCountries) {
        this.countries = queryCountries;
        newQueryParams['countries'] = this.countries;
        shouldNavigate = true;
      } else {
        this.countries = queryCountries;
      }

      // ✅ Evita bucle de navegación
      if (shouldNavigate) {
        this._router.navigate([], {
          relativeTo: this._route,
          queryParams: newQueryParams,
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }

      // ✅ Cargar datos
      this.init_products(
        this.filter,
        this.currentPage,
        this.status,
        this.visibility,
        this.limit,
        this.categories,
        this.brands,
        this.countries,
        this.minPrice,
        this.maxPrice
      );
    });
  }

  

  getCategories(categories: any){
    this.currentPage = 1;
		this.categoriesSelected = categories
		.filter((c: any) => c.checked)
		.map((c: any) => c.id);
	}

  getBrands(brands: any){
    this.currentPage = 1;
		this.brandsSelected = brands
		.filter((c: any) => c.checked)
		.map((c: any) => c.id);
	}

  getCountries(countries: any){
    this.currentPage = 1;
		this.countriesSelected = countries
		.filter((c: any) => c.checked)
		.map((c: any) => c.code);
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

  init_products(filter: string, page: number, status: string, visibility: string, limit: number, categories: string, brands: string, countries: string,minPrice: number | null, maxPrice: number| null) {
    this.loading = true;
    this.errorMsmServerListProducts = '';
    
    this.productService
      .get_products(filter, page, limit, status, visibility, categories, brands, countries, minPrice ,maxPrice)
      .pipe(
        takeUntil(this.destroy$),
        withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (next: { products: any[]; currentPage: number; totaProducts: number; totalPages: number }) => {
          console.log(next);
          this.products = next.products;
          this.totalPages = next.totalPages;
        },
        error: (err) => {
          const error = err.error;
          this.errorMsmServerListProducts = error;
        },
      });
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

  onFilterStatusChange(value: string) {
    this.status = value;
  }

  redirect() {
    console.log(this.categoriesSelected);
    
    this.currentPage = 1;
    this._router.navigate(['/products/articles'], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.status,
        visibility: this.visibility,
				categories: this.categoriesSelected.join(','),
        brands: this.brandsSelected.join(','),
        countries: this.countriesSelected.join(','),
        minPrice: this.minPrice,
        maxPrice: this.maxPrice
			},
		});
	}

  resetFilters(){
    this.filter = '';
    this.currentPage = 1;
    this.limit = 10;
    this.status = 'Todos';
    this.visibility = 'Todos';
    this.categoriesSelected = [];
    this.brands = '';
    this.brandsSelected = [];
    this.countriesSelected = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.redirect();
  }

  setStatus(id: string, status: boolean) {}

}
