import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { visibilities } from '../create-product/constants/visibilities.constant';
import { statusProduct } from '../create-product/constants/statusProduct.contant';
import { Product } from '@app/common/interface/product.interface';
import { productFormHelp } from '../create-product/constants/formProductHelper';
import { PhysicalProduct } from '@app/common/interface/physical-product.interface';
import { AttributeService } from '@app/services/attribute.service';
import { CategoryService } from '@app/services/category.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BrandService } from '@app/services/brand.service';
import { ProductService } from '@app/services/product.service';
import { catchError, EMPTY, finalize, forkJoin, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import Quill from 'quill';
import { UploadImageComponent } from '@app/shared/upload-image/upload-image.component';
import { UploadImagesComponent } from '@app/shared/upload-images/upload-images.component';
import { unitsOfMeasure } from '@app/common/constants/units.constan';
import { conditions } from '@app/common/constants/conditions.constant';
import { warranties } from '@app/common/constants/warranties.constant';
import { countries } from '@app/common/constants/countries.constant';
import { NgxCurrencyDirective } from 'ngx-currency';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TagifyInputComponent } from '@app/shared/tagify-input/tagify-input.component';
import { IconTrashComponent } from '@app/icons/icon-trash/icon-trash.component';
import { temperatures } from '@app/common/constants/temperatures.cosntant';
import { materials } from '@app/common/constants/materials.constant';
import { ShippingProduct } from '@app/common/interface/shipping-product.interface';
import { packages } from '@app/common/constants/packages.constant';
import { skuPatterns } from '@app/common/constants/skuPatterns.constant';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { IconCheckComponent } from '@app/icons/icon-check/icon-check.component';
declare var refreshFsLightbox: any;
declare const toastr: any;

@Component({
  selector: 'aCreate-product',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TopbarComponent,
    SidebarComponent,
    AlertComponent,
    NgSelectModule,
    UploadImageComponent,
    UploadImagesComponent,
    NgxCurrencyDirective,
    NgbTooltipModule,
    TagifyInputComponent,
	IconTrashComponent,
	NotFoundComponent,
	IconCheckComponent
  ],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent {
	public loadProduct : boolean = true;
	public msmErrorProduct: any = [];
	public errorsProduct: any = {
		cover: [],
		miniature: [],
	};
	public option = 1;
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public widthScreen : number = window.innerWidth;
	public visibilities_ : any = visibilities;
	public statusProduct_ : any = statusProduct;
	public loadBtnUpdateProperty : boolean = false;
	public loadBtnAddProperty : boolean = false;
	public loadBtnRemoveProperty : boolean = false;
	public arrProperties : Array<{id?: string, attributeId: any, value: string | undefined, data: [], loading: boolean}> = [
		{
			attributeId: undefined,
			value: undefined,
			data: [],
			loading: false
		}
	];
	public loadProperties : boolean = true;
	public errorMsmSeverListProperties :  string = '';
	@ViewChild('editor') editorRef!: ElementRef;
	public whiteListTags = [];

	public product: Product = {
		visibility: visibilities[0].value,
		status: statusProduct[0].value,
		name: '',
		type: 'Fisico',
		slug: '',
		description: '',
		extract: '',
		cover: '',
		miniature: undefined as File | undefined,
		unitOfMeasure: undefined,
		condition: undefined,
		warranty: undefined,
		countryOfOrigin: undefined,
		priceRegular: '',
		priceDiscount: '',
		tags: [],
		brandId: undefined,
		categoryId: undefined,
		subcategoryId: undefined,
		isBestSeller: false,
		isNewArrival: true,
		isFeatured: false,
		isLimitedEdition: false,
		isPreOrder: false,
		isExportable: false,
		allowBackorder: false,
		productGroupId: undefined
	};

	public physical : PhysicalProduct= {
		weightUnit: undefined,
		dimensionUnit: undefined,
		height: '',
		width: '',
		length: '',
		weight: '',
		isFragile: false,
		isPerishable: false,
		isEcoFriendly: false,
		isBiodegradable: false,
		isHazardous: false,
		isRequiresRefrigeration: false,
		isFlammable: false,
		isRequiresAssembly: false,
		material: undefined,
		storageTempUnit: undefined,
		minStorageTemp: '',
		maxStorageTemp: ''
	}
	public shipping : ShippingProduct = {
		packageType: undefined,
		freeShipping: false,
		pickupInStore: false,
		specialInstructions: '',
		handlingDays: ''
	}
	public units_ = unitsOfMeasure;
	public labelHelper = productFormHelp;
	public conditions_ = conditions;
	public warranties_: any = warranties;
	public countries = countries;
	public currencyOptions = {
			prefix: 'S/ ',
			thousands: ',',
			decimal: '.',
			precision: 2,
			align: 'left',
			allowNegative: false,
		};

	public loadingCategories: boolean = true;
	public errorMsmSeverListCategories: string = '';
	public categories_ : any = [];

	public loadingSubcategories: boolean = true;
	public errorMsmSeverListSubcategories: string = '';
	public subcategories_ : any = [];

	public loadingBrands: boolean = true;
	public errorMsmSeverListBrands: string = '';
	public brands_ : any = [];

	public loadingAttributes: boolean = true;
	public errorMsmSeverListAttributes: string = '';
	public attributes_ : any = [];

	public loadingValuesAttribute: boolean = true;
	public errorMsmSeverListValuesAttribute: string = '';
	public valuesAttribute_ : any = [];

	private quill!: Quill;
	public loadImport : boolean = false;
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));

	public loading : boolean = true;
	public errorMsmServerGetProduct : string = '';
	public id: string = '';
	public coverUrlEdit: any = '';
	public miniatureUrlEdit: any = '';
	public weightUnits_ = unitsOfMeasure.filter(item=> item.group == 'Peso');
	public dimensiontUnits_ = unitsOfMeasure.filter(item=> item.group == 'Longitud');
	public materials_ : any = materials;
	public temperatures_ : any = temperatures;
	public packages_ : any = packages;
	public cover : {file: File, preview: string, index: number} | undefined = undefined;
	public images : Array<{file: File, preview: string, index: number, id: string}> = [];
	public errorsVariation : {name?: string, skuPattern?: string} = {};
	public skuPatterns = skuPatterns;
	public variations : Array<{name: string, skuPattern: any | undefined}> = [];
	public variation : any = {};
	public loadingVariations : boolean = true;
	public filterGroup : string = '';
	public loadingGroups: boolean = true;
	public groups : Array<any> = [];

	public loadPhotos : boolean = true;
	public errorMsmSeverListPhotos : string = '';
	public categorySelected : any = {};

	public loadBtnEditOrCreateProductDescripcion : boolean = false;
	public msmErrorUpdateProductDescripcion: any = [];
	public errorsUpdateProductDescripcion:any = {};
	public idSelectProductDescripcion : string = '';

	public msmErrorCreateProductDescripcion: any = [];
	public errorsCreateProductDescripcion:any = {};

	public loadBtnDeleteProductDescripcion : boolean = false;
	public idSelectToDeleteProductDescripcion : string = '';

	public loadUploadImagesGallery : boolean = false;

	public loadSetCoverGallery : boolean = false;
	public idSelectCoverGallery : string | number = '';

	public loadDeleteCoverGallery : boolean = false;
	public idSelectDeleteCoverGallery : string | number = '';

	public errorMsmSeverListVariations : string = '';

	public loadCreateVariation : boolean = false;
	public errorsCreateVariation : any = {};
	public msmErrorCreateVariation : any = [];
	
	public errorMsmServer: string = '';
  	constructor(
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private brandService: BrandService,
		private sanitizer: DomSanitizer,
		private productService: ProductService,
		private el: ElementRef,
		private router: Router,
    	private _route: ActivatedRoute
	) {}


	ngOnInit() {
		this._route.paramMap.pipe(
			map(params => {
				const qpOption = this._route.snapshot.queryParamMap.get('option');
				return {
					id: params.get('id')!,
					option: qpOption ? Number(qpOption) : 1
				};
			}),

			tap(({ id, option }) => {
				this.id = id;
				this.option = option;
				if (!this._route.snapshot.queryParamMap.get('option')) {
					this.router.navigate([], {
					relativeTo: this._route,
					queryParams: { option: 1 },
					queryParamsHandling: 'merge',
					replaceUrl: true
					});
				}
			}),

			switchMap(({ id, option }) =>
				this.loadProductData$(id).pipe(
					map(data => ({ ...data, option }))
				)
			),

			tap(product => {
				this.assignBaseData(product);
			}),

			switchMap(data =>
				forkJoin({
					categories: this.init_categories$(),
					subcategories: this.init_subcategories$(data.product.categoryId),
					brands: this.init_brands$(),
					arrProperties: this.init_characteristics$(),
					photos: this.init_photos$(),
					variations: this.init_variations$(),
				}).pipe(
					map(() => data)
				)
			),
			takeUntil(this.destroy$)
		).subscribe();
		}



	loadProductData$(id: string) {
		this.loadProduct = true;
		this.errorMsmServerGetProduct = '';
		return this.productService.get_product(id).pipe(
			withMinLoadingTime(400),
			catchError(err => {
				this.errorMsmServerGetProduct =
					err?.error?.message || 'Error cargando el producto';

				return EMPTY;
			}),
			finalize(() => {
			this.loadProduct = false;
			})
		);
	}

	private assignBaseData({ product, physical, shipping }: any): void {
		this.product = product;
		this.physical = physical;
		this.shipping = shipping;
		this.coverUrlEdit = this.product.cover;
		this.miniatureUrlEdit = this.product.miniature;
		this.product.miniature = undefined;
		if (this.quill) {
			this.quill.root.innerHTML = this.product.description || '';
		}
		this.init_attributes$().pipe(takeUntil(this.destroy$))
		.subscribe();;
	}

	getFileName(url: string): string {
		const cleanUrl = url.split('?')[0].split('#')[0];
		return cleanUrl.split('/').pop() || '';
	}

	ngAfterViewInit(): void {
		this.initQuill();
	}

	initQuill() {
		if (!this.editorRef) return;
		if (this.quill) return; // evita duplicado

		this.quill = new Quill(this.editorRef.nativeElement, {
			theme: 'snow'
		});

		this.quill.on('text-change', () => {
			this.product.description = this.quill.root.innerHTML;
		});
	}

	@HostListener('window:resize', [])
	onResize() {
		this.widthScreen = window.innerWidth;
		console.log(this.widthScreen);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	onChangeBoolLabels(){
		if(this.option == 3) this.option = 4;
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

	init_categories$() {
		this.loadingCategories = true;
		this.errorMsmSeverListCategories = '';
		this.categories_ = [];

		return this.categoryService.get_categories_by_select().pipe(
			tap(data => {
				this.categories_ = data.map((v:any) => ({
					...v,
					icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
				}));
				this.categorySelected = this.categories_.find((item:any)=> item.id == this.product.categoryId);	
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
		this.subcategories_ = [];
		return this.categoryService.get_subcategories_by_select(id).pipe(
			tap(data => {
				this.subcategories_ = data;
				this.subcategories_ = this.subcategories_.map((v:any) => ({
					...v,
					icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
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
		this.brands_ = [];
		return this.brandService.get_brands_by_select().pipe(
			tap(data => {
				this.brands_ = data;
			}),

			catchError(err => {
				this.errorMsmSeverListBrands =
					err?.error?.message || 'Error cargando subcategorías';

				return of([]);
			}),

			finalize(() => this.loadingBrands = false)
		);
	}

	init_characteristics$() {
		this.loadProperties = true;
		this.errorMsmSeverListProperties = '';
		this.arrProperties = [];
		return this.productService.get_characteristics_product(this.id).pipe(
			tap(data => {
				this.arrProperties = data;
				console.log(this.arrProperties);
				
			}),

			catchError(err => {
				this.errorMsmSeverListProperties =
					err?.error?.message || 'Error cargando subcategorías';

				return of([]);
			}),

			finalize(() => this.loadProperties = false)
		);
	}

	init_attributes$() {
		this.loadingAttributes = true;
		this.errorMsmSeverListAttributes = '';
		this.attributes_ = [];
		return this.attributeService.get_attributes_by_category(this.product.categoryId!).pipe(
			tap(data => {
				this.attributes_ = data;
			}),

			catchError(err => {
				this.errorMsmSeverListAttributes =
					err?.error?.message || 'Error cargando atributos';

				return of([]);
			}),

			finalize(() => this.loadingAttributes = false)
		);
	}

	init_photos$(){
		this.loadPhotos = true;
		this.errorMsmSeverListPhotos = '';
		this.images = [];
		return this.productService.get_photos_product(this.id).pipe(
			tap(data => {
				this.images = data.map((photo: any, index: any) => ({
					id: photo.id,
					preview: photo.url,
					index,
				}));
				console.log(this.images);
				
				setTimeout(() => {
					refreshFsLightbox();
				}, 50);
			}),

			catchError(err => {
				this.errorMsmSeverListPhotos =
					err?.error?.message || 'Error cargando fotos';

				return of([]);
			}),

			finalize(() => this.loadPhotos = false)
		);
	}

 	onSelectCategory() {
		this.categorySelected = this.categories_.find((item:any)=> item.id == this.product.categoryId);
		this.product.subcategoryId = undefined;
		this.init_subcategories$(this.product.categoryId!)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

  	refreshSubcategories(){
		if(this.product.categoryId){
			this.init_subcategories$(this.product.categoryId!)
			.pipe(takeUntil(this.destroy$))
			.subscribe();
		} 
	}

	init_variations$(){
		this.loadingVariations = true;
		this.errorMsmSeverListVariations = '';
		this.variations = [];
		return this.productService.get_variations_product(this.id).pipe(
			tap(data => {
				this.variations = data;
			}),

			catchError(err => {
				this.errorMsmSeverListPhotos =
					err?.error?.message || 'Error cargando variaciones';

				return of([]);
			}),

			finalize(() => this.loadingVariations = false)
		);
	}

  	setOption(value: number) {
		this.option = value;
		this.router.navigate([], {
			relativeTo: this._route,
			queryParams: { option: value },
			queryParamsHandling: 'merge', // mantiene otros query params
		});
	}

	importProduct(){
		if(this.product.productGroupId){
			this.loadImport = true;
			this.productService.import_product_for_group(this.product.productGroupId)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadImport = false))
			)
			.subscribe({
				next: (next)=>{
					console.log(next);
					this.init_subcategories$(next.product.categoryId);
					this.init_valuesAttribute(next.product.mainAttribute?.id!);
					this.product = {
						...this.product,  
						...next.product, 
					};

					if (next.product.description) {
						this.quill.root.innerHTML = next.product.description;
					}

					this.physical = {
						...this.physical,  
						...next.physical, 
					};
				},
				error: (error)=>{
					console.log(error);
				}
			})
		}
	}

  
  	init_valuesAttribute(id: string) {
		this.loadingValuesAttribute = true;
		this.errorMsmSeverListValuesAttribute = '';
		this.valuesAttribute_ = [];
		this.attributeService
		.get_attributeValues_by_select(id)
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadingValuesAttribute = false))
		)
		.subscribe({
			next: (next) => {
				console.log(next);
				this.valuesAttribute_ = next;
			},
			error: (err) => {
				const error = err.error;
				this.errorMsmSeverListValuesAttribute = error.message;
			},
		});
	}

	onSelectAttributeProperty(idx: number){
		this.arrProperties[idx].value = undefined;
		this.get_valuesAttribute(this.arrProperties[idx]?.attributeId!,idx);
	}

	get_valuesAttribute(id: any,idx: number) {
		this.arrProperties[idx].loading = true;
		this.attributeService
			.get_attributeValues_by_select(id)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.arrProperties[idx].loading = false))
			)
			.subscribe({
				next: (next) => {
					console.log(next);
					this.arrProperties[idx].data = next;
					console.log(this.arrProperties);
					
				}
			});
	}

	refreshBrands(): void {
		this.init_brands$()
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	refreshAttributes(): void {
		this.init_attributes$()
			.pipe(takeUntil(this.destroy$))
			.subscribe();
	}

	onUpdateAttributeProperty(idx: number){
		let data = this.arrProperties[idx];
		this.idSelectProductDescripcion = data.id!;
		this.loadBtnEditOrCreateProductDescripcion = true;
		this.msmErrorUpdateProductDescripcion = [];
		this.errorMsmServer = '';
		this.errorsUpdateProductDescripcion = {};
		
		this.productService
			.update_product_description(data.id!, data!)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtnEditOrCreateProductDescripcion = false))
			)
			.subscribe({
				next: (next) => {
					toastr.success('Caracteristica actualizada correctamente.');
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (error.validation) {
						this.errorsUpdateProductDescripcion = error.validation;
						this.msmErrorUpdateProductDescripcion = Object.values(this.errorsUpdateProductDescripcion).flat();
					}
				},
			});
	}

	onCreateAttributeProperty(idx: number){
		let data : any = this.arrProperties[idx];
		this.idSelectProductDescripcion = data.id!;
		data.productId = this.id;
		
		this.loadBtnEditOrCreateProductDescripcion = true;
		this.msmErrorCreateProductDescripcion = [];
		this.errorMsmServer = '';
		this.errorsCreateProductDescripcion = {};
		
		this.productService
		.create_product_description(data!)
		.pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			takeUntil(this.destroy$),
			finalize(() => (this.loadBtnEditOrCreateProductDescripcion = false))
		)
		.subscribe({
			next: (next) => {
				this.arrProperties[idx].id = next.id;
				toastr.success('Caracteristica creada correctamente.');
			},
			error: (err) => {
				const error = err.error;
				this.errorMsmServer = error.message || '¡Error desconocido!';
				toastr.error(this.errorMsmServer);

				if (error.validation) {
					this.errorsCreateProductDescripcion = error.validation;
					this.msmErrorCreateProductDescripcion = Object.values(this.errorsCreateProductDescripcion).flat();
				}
			},
		});
	}

	onDeleteAttributeProperty(idx: number){
		let data = this.arrProperties[idx];
		this.loadBtnDeleteProductDescripcion = true;
		this.idSelectToDeleteProductDescripcion = data.id!;
		this.productService
			.delete_product_description(data.id!)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtnDeleteProductDescripcion = false))
			)
			.subscribe({
				next: (next) => {
					console.log(next);
					this.arrProperties = this.arrProperties.filter(
						item => item.id !== next.id
					);
					toastr.success('Caracteristica eliminada correctamente.');
				},
				error: (err) => {
					console.log(err);
					
					toastr.error(err.error.message);
				},
			});
	}

	removeImage(idx: number){
		this.images.splice(idx,1)	
	}

	addAttribute(){
		this.arrProperties.push({
			attributeId: undefined,
			value: undefined,
			data: [],
			loading: false
		});
	}

	onSelectedCover(idx: number,cover: string){
		this.loadSetCoverGallery = true;
		this.idSelectCoverGallery = idx;
		this.errorMsmServer = '';
		this.productService
			.set_cover_product(this.id, {cover})
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadSetCoverGallery = false))
			)
			.subscribe({
				next: (next) => {
					this.coverUrlEdit = next.cover;
					toastr.success('Cover actualizado correctamente.');
				},
				error: (err) => {
					console.log(err);
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);
				},
			});
	}

	onRemoveCover(idx: string){
		this.loadDeleteCoverGallery = true;
		this.idSelectDeleteCoverGallery = idx;
		this.productService
			.delete_image_product(this.idSelectDeleteCoverGallery)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadDeleteCoverGallery = false))
			)
			.subscribe({
				next: (next) => {
					console.log(next);
					this.images = this.images.filter(
						item => item.id !== next.id
					);
					toastr.success('Imagen eliminada correctamente.');
				},
				error: (err) => {
					console.log(err);
					toastr.error(err.error.message);
				},
			});
	}

	onUploadImagesGallery(images: any){
		const formData = new FormData();
		formData.append('productId',this.id);
		images.forEach((file: {file: File, preview: string, index: number}) => {
			formData.append('gallery', file.file);
		});
		
		this.loadUploadImagesGallery = true;
		this.productService
		.upload_images_product(formData)
		.pipe(
			takeUntil(this.destroy$),
			finalize(() => (this.loadUploadImagesGallery = false))
		)
		.subscribe({
			next: (next) => {
				console.log(next);
				
				const lastIndex = this.images.length
				? Math.max(...this.images.map(x => x.index))
				: 0;
				const news = next.map((item:any, i: any) => ({
					preview: item.url,
					index: lastIndex + i + 1,
					id: item.id
				}));
				this.images.push(...news);
				toastr.success('Caracteristica eliminada correctamente.');
			},
			error: (err) => {
				console.log(err);
				
				toastr.error(err.error.message);
			},
		});
	}

	onCreateVariation(){
		console.log(this.variation);
		this.loadCreateVariation = true;
		this.variation.productId = this.id;
		this.productService
		.create_variation_product(this.variation)
		.pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			takeUntil(this.destroy$),
			finalize(() => (this.loadCreateVariation = false))
		)
		.subscribe({
			next: (next) => {
				console.log();
				this.variations.push(next);
				this.variation = {};
				toastr.success('Variación creada correctamente.');
			},
			error: (err) => {
				const error = err.error;
				this.errorMsmServer = error.message || '¡Error desconocido!';
				toastr.error(this.errorMsmServer);

				if (error.validation) {
					this.errorsCreateVariation = error.validation;
					this.msmErrorCreateVariation = Object.values(this.errorsCreateVariation).flat();
				}
			},
		});
	}

	init_groups(){
		this.loadingGroups = true;
		this.productService.get_groups_for_create_product(this.filterGroup)
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadingGroups = false))
		)
		.subscribe({
			next: (next)=>{
				this.groups = next;
			},
			error: (error)=>{
				console.log(error);
				
			}
		});
	}

	onRemoveVariation(idx: number){
	}

	onSelectGroup(id: string){
		this.product.productGroupId = id;
	}

	onTagsChange = (tags: string[]) => this.product.tags = tags;
	onContentChange = (content: string) => this.product.description = content;

	update(){

	}
}
