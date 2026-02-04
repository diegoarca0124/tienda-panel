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
import { finalize, Subject, takeUntil } from 'rxjs';
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

@Component({
  selector: 'app-edit-product',
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
	public arrProperties : Array<{id?: string, attribute: any, value: string | undefined, data: [], loading: boolean}> = [
		{
			attribute: undefined,
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
		cover: undefined as File | undefined,
		miniature: undefined as File | undefined,
		mainAttribute: undefined,
		mainAttributeValue: undefined,
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
	public images : Array<{file?: File, preview: string, index: number}> = [];
	public errorsVariation : {name?: string, skuPattern?: string} = {};
	public skuPatterns = skuPatterns;
	public variations : Array<{name: string, skuPattern: any | undefined}> = [];
	public variation = {
		skuPattern: undefined,
		name: ''
	}
	public loadingVariations : boolean = true;
	public filterGroup : string = '';
	public loadingGroups: boolean = true;
	public groups : Array<any> = [];

	public loadPhotos : boolean = true;
	public errorMsmSeverListPhotos : string = '';

  
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


	ngOnInit(){
		this.initRouteParams();
		this.loadProductData();
	}

	private initRouteParams(): void {
		this.id = this._route.snapshot.paramMap.get('id')!;

		const optionParam = this._route.snapshot.queryParamMap.get('option');
		this.option = optionParam ? Number(optionParam) : 1;

		if (!optionParam) {
			this.router.navigate([], {
				relativeTo: this._route,
				queryParams: { option: this.option },
				queryParamsHandling: 'merge',
				replaceUrl: true,
			});
		}
	}

	private loadProductData(): void {
		this.loadProduct = true;
		this.errorMsmServerGetProduct = '';
		
		this.productService
		.get_product(this.id)
		.pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			takeUntil(this.destroy$),
			finalize(() => (this.loadProduct = false))
		)
		.subscribe({
			next: (response) => this.handleProductResponse(response),
			error: ({ error }) => (this.errorMsmServerGetProduct = error),
		});
	}

	private handleProductResponse(response: any): void {
		console.log(response);
		
		this.assignBaseData(response);
		this.prepareMedia();
		this.initializeStaticData();
		this.initializeConditionalData();
	}

	private assignBaseData({ product, physical, shipping }: any): void {
		this.product = product;
		this.physical = physical;
		this.shipping = shipping;
	}

	private prepareMedia(): void {
		this.coverUrlEdit = this.product.cover;
		this.miniatureUrlEdit = this.product.miniature;

		this.product.cover = undefined;
		this.product.miniature = undefined;
	}

	private initializeStaticData(): void {
		this.init_categories();
		this.init_brands();
		this.init_attributes();
		this.init_groups();
		this.init_characteristics();
		this.init_photos();
		this.init_variations();
	}

	private initializeConditionalData(): void {
		if (this.product.categoryId) {
			this.init_subcategories(this.product.categoryId);
		}

		if (this.product.mainAttribute?.id) {
			this.init_valuesAttribute(this.product.mainAttribute.id);
		}else{
			this.loadingValuesAttribute = false;
		}

		if (this.product.description) {
			this.setQuillContent(this.product.description);
		}
	}

	private setQuillContent(description: string): void {
		setTimeout(() => {
			this.quill?.root && (this.quill.root.innerHTML = description);
		}, 50);
	}

	ngAfterViewInit(): void {
		if (!this.editorRef) return;

		this.quill = new Quill(this.editorRef.nativeElement, {
			theme: 'snow',
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

	init_variations(){
		this.loadingVariations = true;
		this.productService.get_variations_product(this.id)
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadingVariations = false))
		)
		.subscribe({
			next : (next) => {
				this.variations = next;
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	init_characteristics() {
		this.loadProperties = true;
		this.errorMsmSeverListProperties = '';
		this.arrProperties = [];
		this.productService
		.get_characteristics_product(this.id)
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadProperties = false))
		)
		.subscribe({
			next: (next) => {
				this.arrProperties = next;
			},
			error: (err) => {
				const error = err.error;
				this.errorMsmSeverListProperties = error.message;
			},
		});
	}

	init_photos(){
		this.loadPhotos = true;
		this.errorMsmSeverListPhotos = '';
		this.images = [];
		this.productService
		.get_photos_product(this.id)
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadPhotos = false))
		)
		.subscribe({
			next: (next: any) => {
				this.images = next.map((photo: any, index: any) => ({
					preview: photo.url,
					index,
				}));
				setTimeout(() => {
					refreshFsLightbox();
				}, 50);
			},
			error: (err) => {
				const error = err.error;
				this.errorMsmSeverListPhotos = error.message;
			},
		});
	}

	onChangeBoolLabels(){
		if(this.option == 3) this.option = 4;
	}

	refreshCategories(){
		this.init_categories();
		if(this.product.categoryId) this.init_subcategories(this.product.categoryId);
	}

	init_categories() {
		this.loadingCategories = true;
		this.errorMsmSeverListCategories = '';
		this.categories_ = [];
		this.categoryService
		.get_categories_by_select()
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadingCategories = false))
		)
		.subscribe({
			next: (next) => {
			this.categories_ = next;
			this.categories_ = this.categories_.map((v:any) => ({
				...v,
				icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
			}));
			},
			error: (err) => {
			const error = err.error;
			this.errorMsmSeverListCategories = error.message;
			},
		});
	}

  	init_subcategories(id: string | undefined) {
		this.loadingSubcategories = true;
		this.errorMsmSeverListSubcategories = '';
		this.subcategories_ = [];
		this.categoryService
		.get_subcategories_by_select(id!)
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => (this.loadingSubcategories = false))
		)
		.subscribe({
			next: (next) => {
				console.log(next);
				this.subcategories_ = next;
				this.subcategories_ = this.subcategories_.map((v:any) => ({
					...v,
					icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
				}));
			},
			error: (err) => {
				const error = err.error;
				this.errorMsmSeverListSubcategories = error.message;
			},
		});
	}

 	onSelectCategory() {
		this.product.subcategoryId = undefined;
		this.init_subcategories(this.product.categoryId);
	}

  	refreshSubcategories(){
		if(this.product.categoryId) this.init_subcategories(this.product.categoryId);
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
					this.init_subcategories(next.product.categoryId);
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

  init_brands() {
		this.loadingBrands = true;
		this.errorMsmSeverListBrands = '';
		this.brands_ = [];
		this.brandService
			.get_brands_by_select()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingBrands = false))
			)
			.subscribe({
				next: (next) => {
					this.brands_ = next;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmSeverListBrands = error.message;
				},
			});
	}

  init_attributes() {
		this.loadingAttributes = true;
		this.errorMsmSeverListAttributes = '';
		this.attributes_ = [];
		this.attributeService
			.get_attributes_by_select()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingAttributes = false))
			)
			.subscribe({
				next: (next) => {
					this.attributes_ = next;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmSeverListAttributes = error.message;
				},
			});
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

	refreshBrands(){
		this.init_brands();
	}

	refreshAttributes(){
		this.init_attributes();
		if(this.product.mainAttribute) this.init_valuesAttribute(this.product.mainAttribute.id);
	}

	refreshAttributeValues(){
		if(this.product.mainAttribute) this.init_valuesAttribute(this.product.mainAttribute.id);
	}

	onSelectAttribute() {
		this.product.mainAttributeValue = undefined;
		this.init_valuesAttribute(this.product.mainAttribute?.id!);
	}

	onRemoveAttributeProperty(idx: number){
		this.arrProperties.splice(idx,1)
	}

	removeImage(idx: number){
		this.images.splice(idx,1)	
	}

	addAttribute(){
		this.arrProperties.push({
			attribute: undefined,
			value: undefined,
			data: [],
			loading: false
		});
	}

	onSelectedBanner(image : {file?: File, preview: string, index: number}){
		/* this.cover = image;
		this.product.cover = this.cover.file; */
	}

	onSelectFiles(event: any){
		this.images.push(...event);
		this.images.forEach((element, index) => {
			element.index = index;
		});

		setTimeout(() => {
			refreshFsLightbox();
		}, 50);
	}

	addVariation(){
		this.errorsVariation = {};
		if (!this.variation.skuPattern)
		this.errorsVariation.skuPattern = 'La plantilla del SKU es requerida.';

		if (!this.variation.name)
		this.errorsVariation.name = 'El nombre de la variación es requerido.';

		if (Object.keys(this.errorsVariation).length > 0) return;
		
		this.variations.push({ ...this.variation });
		this.variation.name = '';
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
