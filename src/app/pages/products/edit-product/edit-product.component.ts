import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { GeneralCreateProductComponent } from '../components/general-create-product/general-create-product.component';
import { PropertyCreateProductComponent } from '../components/property-create-product/property-create-product.component';
import { GalleryCreateProductComponent } from '../components/gallery-create-product/gallery-create-product.component';
import { ShippingCreateProductComponent } from '../components/shipping-create-product/shipping-create-product.component';
import { VariationsCreateProductComponent } from '../components/variations-create-product/variations-create-product.component';
import { GroupCreateProductComponent } from '../components/group-create-product/group-create-product.component';
import { MenuCreateProductComponent } from '../components/menu-create-product/menu-create-product.component';
import { CharacteristicCreateProductComponent } from '../components/characteristic-create-product/characteristic-create-product.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { createEmptyProduct, createEmptyProductPhysical, createEmptyProductShipping } from '../utils/empties.util';
import { PhysicalProduct } from '@app/common/interface/physical-product.interface';
import { ShippingProduct } from '@app/common/interface/shipping-product.interface';
import { productFormHelp } from '../constants/form-product-helper.constant';
import { catchError, EMPTY, finalize, forkJoin, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { visibilities } from '../constants/visibilities.constant';
import { statusProduct } from '../constants/status-product.contant';
import { showErrorsProduct } from '../constants/show-errors-product.constant';
import { labels } from '@app/common/constants/labels.constant';
import { ProductService } from '@app/services/product.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryService } from '@app/services/category.service';
import { DomSanitizer } from '@angular/platform-browser';
import { CategoryInterface } from '@app/pages/categories/interfaces/category.interface';
import { SubcategoryInterface } from '../interfaces/subcategory.interface';
import { BrandService } from '@app/services/brand.service';
import { BrandInterface } from '../interfaces/brands.interface';
import { environment } from 'environments/environment.dev';
import { GLOBAL } from '@app/services/GLOBAL';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { ProductInterface } from '../interfaces/product.interface';
declare const toastr:any;

@Component({
  selector: 'app-edit-product',
  imports: [
	SidebarComponent,
	TopbarComponent,
	RouterModule,
	CommonModule,
	FormsModule,
	NgSelectModule,
	FallbackImageDirective,
	GeneralCreateProductComponent,
	PropertyCreateProductComponent,
	ShippingCreateProductComponent,
	GalleryCreateProductComponent,
	VariationsCreateProductComponent,
	GroupCreateProductComponent,
	MenuCreateProductComponent,
	CharacteristicCreateProductComponent,
	ValidationPopoverComponent,
	NotFoundComponent
  ],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditProductComponent {
	@ViewChild('characteristics') characteristics!: CharacteristicCreateProductComponent;
	@ViewChild('gallery') gallery!: GalleryCreateProductComponent;
	@ViewChild('variations') variations!: VariationsCreateProductComponent;
	public product: ProductInterface = createEmptyProduct();
	public product_const: ProductInterface = createEmptyProduct();
	public physical : PhysicalProduct = createEmptyProductPhysical();
	public shipping : ShippingProduct = createEmptyProductShipping();
	public errorsProduct: any = {};
	public variation = {
		skuPattern: undefined,
		name: ''
	}
	public loadProduct : boolean = true;
	public labelHelper = productFormHelp;
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public categories : any = [];
	public visibilities : any = visibilities;
	public statusProduct : any = statusProduct;
	public showErrors = showErrorsProduct;
	public categorySelected : any = {};
	public tab : any = 'general';
	public images : Array<{file: File, preview: string, index: number}> = [];

	public subcategories : any = [];
	public brands: any = [];
	public errorMsmSeverListCategories: string = '';
	public errorMsmSeverListSubcategories: string = '';
	public errorMsmSeverListBrands: string = '';
	public loadingBrands: boolean = true;
	public loadingCategories: boolean = true;
	public loadingSubcategories: boolean = false;
	public whiteListLabels = labels;
	public whiteListTags = [];
	public loadImport : boolean = false;
	public id: string = '';
	public msmErrorProduct: any = [];
	public errorMsmServerGetProduct : string = '';
	readonly qualityLabels: Record<string, string> = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta',
	};

	constructor(
		private _route : ActivatedRoute,
		private router : Router,
		private productService : ProductService,
		private categoryService : CategoryService,
		private brandService : BrandService,
		private sanitizer: DomSanitizer,
	){
	
	}

	ngOnInit() {
		this._route.paramMap.pipe(
			map(params => ({
				id: params.get('id')!,
				tab: this._route.snapshot.queryParamMap.get('tab') ?? 'general'
			})),

			tap(({ id, tab }) => {
				this.loadProduct = true;
				this.id = id;
				this.tab = tab;
			}),

			switchMap(({ id, tab }) =>
				this.loadProductData$(id).pipe(
					tap(product => this.assignBaseData(product)),
					switchMap(data =>
						forkJoin({
							categories: this.init_categories$(),
							subcategories: this.init_subcategories$(data.product.categoryId),
							brands: this.init_brands$(),
						}).pipe(
							map(() => data)
						)
					),
					finalize(() => this.loadProduct = false)
				)
			),

			takeUntil(this.destroy$)
		).subscribe();
	}

	/* @HostListener('window:beforeunload', ['$event'])
	onBeforeUnload(event: BeforeUnloadEvent) {
		event.preventDefault();
		event.returnValue = '';
	} */

	loadProductData$(id: string) {
		this.errorMsmServerGetProduct = '';
		return this.productService.get_product(id).pipe(
			withMinLoadingTime(400),
			catchError(err => {
				const error = err.error;
				this.errorMsmServerGetProduct = error;
				return EMPTY;
			})
		);
	}

	init_categories$() {
		this.loadingCategories = true;
		this.errorMsmSeverListCategories = '';
		this.categories = [];

		return this.categoryService.get_categories_by_select().pipe(
			tap((next: {data: CategoryInterface[], message: string}) => {
				this.categories = next.data.map((v:any) => ({
					...v,
					iconSafe: this.sanitizer.bypassSecurityTrustHtml(v.icon)
				}));
				console.log(this.categories);
				
				this.categorySelected = this.categories.find((item:any)=> item.id == this.product.categoryId);	
			}),
			catchError(err => {
				this.errorMsmSeverListCategories =
					err?.error?.message || 'Error cargando categorías';

				return of([]);
			}),
			finalize(() => this.loadingCategories = false)
		);
	}

	init_subcategories$(id: string) {
		this.loadingSubcategories = true;
		this.errorMsmSeverListSubcategories = '';
		this.subcategories = [];
		return this.categoryService.get_subcategories_by_select(id).pipe(
			tap((next: {data: SubcategoryInterface[], message: string}) => {
				this.subcategories = next.data;
				this.subcategories = this.subcategories.map((v:any) => ({
					...v,
					iconSafe: this.sanitizer.bypassSecurityTrustHtml(v.icon)
				}));
			}),

			catchError(err => {
				this.errorMsmSeverListSubcategories =
					err?.error?.message || 'Error cargando caracteristicas';

				return of([]);
			}),

			finalize(() => this.loadingSubcategories = false)
		);
	}

	init_brands$() {
		this.loadingBrands = true;
		this.errorMsmSeverListBrands = '';
		this.brands = [];
		return this.brandService.get_brands_by_select().pipe(
			tap((data : BrandInterface[]) => {
				this.brands = data;
				this.brands = this.brands.map((brand : any) => ({
					...brand,
					logoUrl: `${environment.s3_public_url}/brands/small/${brand.logoUrl}`,
				}));
			}),

			catchError(err => {
				this.errorMsmSeverListBrands =
					err?.error?.message || 'Error cargando subcategorías';
				return of([]);
			}),

			finalize(() => this.loadingBrands = false)
		);
	}

	private assignBaseData({ product, physical, shipping }: any): void {
		this.product = product;
		this.product.cover_preview = `${environment.s3_public_url}/products/small/${product.cover}`;
		this.product_const = {...this.product};
		this.physical = physical;
		this.shipping = shipping;
		
	}


	update(){
		const product = {
			id: this.product.id,
			visibility : this.product.visibility,
			status: this.product.status,
			name: this.product.name,
			unitOfMeasure: this.product.unitOfMeasure,
			countryOfOrigin: this.product.countryOfOrigin,
			warranty: this.product.warranty,
			condition: this.product.condition,
			description: this.product.description,
			extract: this.product.extract,
			tags: this.product.tags,
			priceRegular: this.product.priceRegular,
			priceDiscount: this.product.priceDiscount,
			allowBackorder: this.product.allowBackorder,
			maxOrderLimit: this.product.maxOrderLimit,
			maxStock: this.product.maxStock,
			minStock: this.product.minStock,
			brandId: this.product.brandId,
			categoryId: this.product.categoryId,
			subcategoryId: this.product.subcategoryId,

			isBestSeller: this.product.isBestSeller,
			isNewArrival: this.product.isNewArrival,
			isFeatured: this.product.isFeatured,
			isLimitedEdition: this.product.isLimitedEdition,
			isPreOrder: this.product.isPreOrder,
			isExportable: this.product.isExportable,
		}
		const physical = {
			dimensionUnit: this.physical.dimensionUnit,
			weightUnit: this.physical.weightUnit,
			height: this.physical.height,
			width: this.physical.width,
			weight: this.physical.weight,
			length: this.physical.length,
			storageTempUnit: this.physical.storageTempUnit,
			maxStorageTemp: this.physical.maxStorageTemp,
			minStorageTemp: this.physical.minStorageTemp,

			isFragile: this.physical.isFragile,
			isPerishable: this.physical.isPerishable,
			isEcoFriendly: this.physical.isEcoFriendly,
			isBiodegradable: this.physical.isBiodegradable,
			isRequiresRefrigeration: this.physical.isRequiresRefrigeration,
			isRequiresAssembly: this.physical.isRequiresAssembly,
			isHazardous: this.physical.isHazardous,
			isFlammable: this.physical.isFlammable,
		}
		const shipping = {
			packageType: this.shipping.packageType,
			pickupInStore: this.shipping.pickupInStore,
			freeShipping: this.shipping.freeShipping,
			handlingDays: this.shipping.handlingDays,
			specialInstructions: this.shipping.specialInstructions,
		}

		const data = {
			...product,
			...physical,
			...shipping
		}
		this.loadBtn = true;
		this.productService.update_product(this.id,data)
		.pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			takeUntil(this.destroy$),
			finalize(() => (this.loadBtn = false))
		)
		.subscribe({
			next: (next) =>{
				this.errorsProduct = {};
				toastr.success(next.message);
			},
			error: (err) =>{
				this.errorsProduct = {};
				const error = err.error;
				toastr.error(error.message || '¡Error desconocido!');
				console.log(error.validation);
				if (error.validation) {
					this.errorsProduct = {
						...this.errorsProduct,
						...error.validation, 
					};
					this.msmErrorProduct = Object.values(this.errorsProduct).flat();
					for (const key in this.showErrors) {
						this.showErrors[key as keyof typeof this.showErrors] =
						!!this.errorsProduct?.[key]?.length;
					}
				}
			}
		})
		
	}

	refreshBrands(): void {
		this.init_brands$()
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	refreshCategories(){
		this.init_categories$().pipe(
			switchMap(() => {
				if (!this.product.categoryId) return of([]);
				return this.init_subcategories$(this.product.categoryId);
			}),
			takeUntil(this.destroy$)
		).subscribe();
	}

	refreshSubcategories(){
		if(this.product.categoryId){
			this.init_subcategories$(this.product.categoryId!)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
		} 
	}

	onSelectCategory() {
		this.categorySelected = this.categories.find((item:any)=> item.id == this.product.categoryId);
		this.product.subcategoryId = undefined;
		this.init_subcategories$(this.product.categoryId!)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	importProduct(){

	}
}

