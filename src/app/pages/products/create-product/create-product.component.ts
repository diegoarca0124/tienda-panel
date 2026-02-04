import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TinymceEditorComponent } from '@app/shared/tinymce-editor/tinymce-editor.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { basic_properties, full_properties } from './constants/propertiesTinymce.constant';
import { environment } from 'environments/environment.dev';
import { AttributeService } from '@app/services/attribute.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '@app/services/category.service';
import { Product } from '@app/common/interface/product.interface';
import { BrandService } from '@app/services/brand.service';
import { TagifyInputComponent } from '@app/shared/tagify-input/tagify-input.component';
import { labels } from '@app/common/constants/labels.constant';
import { countries } from '@app/common/constants/countries.constant';
import { NgxCurrencyDirective } from 'ngx-currency';
import { IconCheckComponent } from '@app/icons/icon-check/icon-check.component';
import { unitsOfMeasure } from '@app/common/constants/units.constan';
import { conditions } from '@app/common/constants/conditions.constant';
import { warranties } from '@app/common/constants/warranties.constant';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { visibilities } from './constants/visibilities.constant';
import { statusProduct } from './constants/statusProduct.contant';
import { materials } from '@app/common/constants/materials.constant';
import { temperatures } from '@app/common/constants/temperatures.cosntant';
import { packages } from '@app/common/constants/packages.constant';
import { IconTrashComponent } from '@app/icons/icon-trash/icon-trash.component';
import { UploadImagesComponent } from '@app/shared/upload-images/upload-images.component';
declare var refreshFsLightbox: any;
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { productFormHelp } from './constants/formProductHelper';
import { IconImageComponent } from '@app/icons/icon-image/icon-image.component';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { UploadImageComponent } from '@app/shared/upload-image/upload-image.component';
import { skuPatterns } from '@app/common/constants/skuPatterns.constant';
import { PhysicalProduct } from '@app/common/interface/physical-product.interface';
import { ShippingProduct } from '@app/common/interface/shipping-product.interface';
import { ProductService } from '@app/services/product.service';
import { productMock } from './mocks/product.mock';
import { PhysicalMock } from './mocks/physical.mock';
import { ShippingMock } from './mocks/shipping.mock';
import { VariationMock } from './mocks/variation.mock';
declare const toastr: any;
import Quill from 'quill';

@Component({
	selector: 'app-create-product',
	imports: [
		SidebarComponent,
		TopbarComponent,
		RouterModule,
		CommonModule,
		TinymceEditorComponent,
		NgSelectModule,
		FormsModule,
		TagifyInputComponent,
		NgxCurrencyDirective,
		IconTrashComponent,
		UploadImagesComponent,
		NgbTooltipModule,
		IconImageComponent,
		AlertComponent,
		UploadImageComponent,
		IconTrashComponent,
		IconCheckComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: './create-product.component.html',
	styleUrl: './create-product.component.css',
})
export class CreateProductComponent {
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

	public errorsProduct: any = {
		cover: [],
		miniature: [],
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

	public variation = {
		skuPattern: undefined,
		name: ''
	}

	public filterGroup : string = '';
	public labelHelper = productFormHelp;
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public properties = environment.tinymceSettings == 'basic' ? basic_properties : full_properties;
	public categories_ : any = [];
	public visibilities_ : any = visibilities;
	public statusProduct_ : any = statusProduct;
	public packages_ : any = packages;
	public subcategories_ : any = [];
	public materials_ : any = materials;
	public temperatures_ : any = temperatures;
	public attributes_ = [];
	public valuesAttribute_ = [];
	public units_ = unitsOfMeasure;
	public weightUnits_ = unitsOfMeasure.filter(item=> item.group == 'Peso');
	public dimensiontUnits_ = unitsOfMeasure.filter(item=> item.group == 'Longitud');
	public conditions_ = conditions;
	public brands_: any = [];
	public warranties_: any = warranties;
	public categories: string = '';
	public errorMsmSeverListCategories: string = '';
	public errorMsmSeverListAttributes: string = '';
	public errorMsmSeverListSubcategories: string = '';
	public errorMsmSeverListBrands: string = '';
	public errorMsmSeverListValuesAttribute: string = '';
	public loadingBrands: boolean = true;
	public loadingGroups: boolean = false;
	public loadingAttributes: boolean = true;
	public loadingCategories: boolean = true;
	public loadingSubcategories: boolean = false;
	public loadingValuesAttribute: boolean = false;
	public whiteListLabels = labels;
	public whiteListTags = [];
	public countries = countries;
	public currencyOptions = {
		prefix: 'S/ ',
		thousands: ',',
		decimal: '.',
		precision: 2,
		align: 'left',
		allowNegative: false,
	};
	public option = 1;
  	public maskRef: any;
	public arrProperties : Array<{attribute: any, value: string | undefined, data: [], loading: boolean}> = [
		{
			attribute: undefined,
			value: undefined,
			data: [],
			loading: false
		}
	];
	public attributes : any[] = [];
	public groups : Array<any> = [];
	public variations : Array<{name: string, skuPattern: any | undefined}> = [];
	public images : Array<{file: File, preview: string, index: number}> = [];
	public cover : {file: File, preview: string, index: number} | undefined = undefined;
	public widthScreen : number = window.innerWidth;
	public skuPatterns = skuPatterns;
	public errorsVariation : {name?: string, skuPattern?: string} = {};
	public errorMsmServer: string = '';
	public msmErrorProduct: any = [];
	public boolDimensions = false;
	public boolCharacteristics = false;
	public boolLabels = false;
	private quill!: Quill;
	public loadImport : boolean = false;
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	@ViewChild('editor') editorRef!: ElementRef;
	
	constructor(
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private brandService: BrandService,
		private sanitizer: DomSanitizer,
		private productService: ProductService,
		private el: ElementRef,
		private _router: Router
	) {}

	ngOnInit(
		
	) {
		this.init_categories();
		this.init_brands();
		this.init_attributes();
		this.init_groups();
		this.visibilities_ = this.visibilities_.map((v:any) => ({
			...v,
			icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
		}));
		this.statusProduct_ = this.statusProduct_.map((v:any) => ({
			...v,
			icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
		}));

		/* this.init_subcategories(productMock.categoryId);
		this.product = productMock;
		this.physical = PhysicalMock;
		this.shipping = ShippingMock;
		this.variations = VariationMock; */

	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
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

	onChangeBoolLabels(){
		if(this.option == 3) this.option = 4;
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
				console.log(next);
				this.groups = next;
			},
			error: (error)=>{
				console.log(error);
				
			}
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

	onSelectedBanner(image : {file: File, preview: string, index: number}){
		this.cover = image;
		this.product.cover = this.cover.file;
	}

	onSelectCategory() {
		this.product.subcategoryId = undefined;
		this.init_subcategories(this.product.categoryId);
	}

	onSelectAttribute() {
		this.product.mainAttributeValue = undefined;
		this.init_valuesAttribute(this.product.mainAttribute?.id!);
	}

	onSelectAttributeProperty(idx: number){
		this.arrProperties[idx].value = undefined;
		this.get_valuesAttribute(this.arrProperties[idx]?.attribute?.id!,idx);
		
	}

	onRemoveAttributeProperty(idx: number){
		this.arrProperties.splice(idx,1)
	}
	
	onRemoveVariation(idx: number){
		this.variations.splice(idx,1)
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

	setDimensions(){
		if(this.boolDimensions){
			this.option = 4;
			this.physical.weightUnit = undefined;
			this.physical.dimensionUnit = undefined;
			this.physical.height = '';
			this.physical.weight = '';
			this.physical.width = '';
			this.physical.length = '';
		}
	}

	setCharacteristics(){
		if(this.boolCharacteristics){
			this.option = 2;
			this.arrProperties = [];
		}else{
			if(this.option == 2){
				if(this.boolLabels){
					this.option = 3;
				}else{
					this.option = 4;
				}
			}
		}
	}

	setOption(value: number) {
		this.option = value;
	}

	onTagsChange = (tags: string[]) => this.product.tags = tags;
	onContentChange = (content: string) => this.product.description = content;

	addAttribute(){
		this.arrProperties.push({
			attribute: undefined,
			value: undefined,
			data: [],
			loading: false
		});
	}

	removeImage(idx: number){
		this.images.splice(idx,1)	
	}

	refreshCategories(){
		this.init_categories();
		if(this.product.categoryId) this.init_subcategories(this.product.categoryId);
	}

	refreshSubcategories(){
		if(this.product.categoryId) this.init_subcategories(this.product.categoryId);
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

	onSelectGroup(id: string){
		this.product.productGroupId = id;
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

					if(next.physical.weight || next.physical.width || next.physical.height || next.physical.length){
						this.boolDimensions = true;
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

	filterGroups(){}

	create() {
		const formData = new FormData();


		if(!this.physical.minStorageTemp) delete this.physical.minStorageTemp;
		if(!this.physical.maxStorageTemp) delete this.physical.maxStorageTemp;

		this.attributes = this.arrProperties
		.filter((p: any) => p?.attribute?.name)  // <-- Filtra los inválidos
		.map((p: any) => ({
			attribute: p.attribute.name,
			value: p.value?.value ?? null,
		}));
		console.log(this.product);
		console.log(this.physical);

		if(this.physical.height == null) this.physical.height = ''; 
		if(this.physical.weight == null) this.physical.weight = ''; 
		if(this.physical.width == null) this.physical.width = ''; 
		if(this.physical.length == null) this.physical.length = ''; 
		
		
		if(this.product.productGroupId)formData.append('productGroupId',this.product.productGroupId.toString());
		formData.append('boolDimensions',this.boolDimensions.toString());
		formData.append('name',this.product.name);
		formData.append('type',this.product.type);
		formData.append('status',this.product.status!);
		formData.append('visibility',this.product.visibility);
		formData.append('description',this.product.description);
		formData.append('extract',this.product.extract);
		if(this.product.mainAttribute != undefined)formData.append('mainAttribute',JSON.stringify(this.product.mainAttribute));
		if(this.product.mainAttributeValue)formData.append('mainAttributeValue',this.product.mainAttributeValue);
		if(this.product.unitOfMeasure != undefined)formData.append('unitOfMeasure',JSON.stringify(this.product.unitOfMeasure));
		if(this.product.condition != undefined)formData.append('condition',this.product.condition!?.toString());
		if(this.product.warranty != undefined)formData.append('warranty',this.product.warranty.toString());
		if(this.product.countryOfOrigin != undefined)formData.append('countryOfOrigin',JSON.stringify(this.product.countryOfOrigin));
		if(this.product.priceRegular != '')formData.append('priceRegular',this.product.priceRegular.toString());
		if(this.product.priceDiscount != '')formData.append('priceDiscount',this.product.priceDiscount!?.toString());
		formData.append('tags',JSON.stringify(this.product.tags));
		if(this.product.brandId != undefined)formData.append('brandId',this.product.brandId!);
		if(this.product.categoryId != undefined)formData.append('categoryId',this.product.categoryId!);
		if(this.product.subcategoryId != undefined)formData.append('subcategoryId',this.product.subcategoryId!);
		formData.append('isBestSeller',this.product.isBestSeller.toString());
		formData.append('isNewArrival',this.product.isNewArrival.toString());
		formData.append('isFeatured',this.product.isFeatured.toString());
		formData.append('isLimitedEdition',this.product.isLimitedEdition.toString());
		formData.append('isPreOrder',this.product.isPreOrder.toString());
		formData.append('isExportable',this.product.isExportable.toString());
		formData.append('allowBackorder',this.product.allowBackorder.toString());
		if (this.product.cover != undefined) formData.append('cover', this.product.cover);
		if (this.product.miniature != undefined) formData.append('miniature', this.product.miniature);

		if(this.physical.weight != '')formData.append('weight',this.physical.weight.toString());
		if(this.physical.weightUnit != undefined) formData.append('weightUnit',JSON.stringify(this.physical.weightUnit));
		if(this.physical.height != '')formData.append('height',this.physical.height.toString());
		if(this.physical.width != '')formData.append('width',this.physical.width.toString());
		if(this.physical.length != '')formData.append('length',this.physical.length.toString());
		if(this.physical.dimensionUnit != undefined) formData.append('dimensionUnit',JSON.stringify(this.physical.dimensionUnit));
		formData.append('isFragile',this.physical.isFragile.toString());
		formData.append('isPerishable',this.physical.isPerishable.toString());
		formData.append('isEcoFriendly',this.physical.isEcoFriendly.toString());
		formData.append('isBiodegradable',this.physical.isBiodegradable.toString());
		formData.append('isHazardous',this.physical.isHazardous.toString());
		formData.append('isRequiresRefrigeration',this.physical.isRequiresRefrigeration.toString());
		formData.append('isFlammable',this.physical.isFlammable.toString());
		formData.append('isRequiresAssembly',this.physical.isRequiresAssembly.toString());
		if(this.physical.minStorageTemp)formData.append('minStorageTemp',this.physical.minStorageTemp!.toString());
		if(this.physical.maxStorageTemp)formData.append('maxStorageTemp',this.physical.maxStorageTemp!.toString());
		if(this.physical.storageTempUnit != undefined) if(this.physical.storageTempUnit)formData.append('storageTempUnit',JSON.stringify(this.physical.storageTempUnit));
		if(this.physical.material != undefined) formData.append('material',this.physical.material.toString());

		if(this.shipping.packageType != undefined)formData.append('packageType',this.shipping.packageType.toString());
		if(this.shipping.handlingDays != undefined)formData.append('handlingDays',this.shipping.handlingDays.toString());
		formData.append('freeShipping',this.shipping.freeShipping.toString());
		formData.append('pickupInStore',this.shipping.pickupInStore.toString());
		if(this.shipping.specialInstructions)formData.append('weight',this.shipping.specialInstructions.toString());

		this.images.forEach((file: {file: File, preview: string, index: number}) => {
			formData.append('gallery', file.file);
		});

		formData.append('attributes',JSON.stringify(this.attributes));
		formData.append('variations',JSON.stringify(this.variations));

		const formDataObject = Object.fromEntries(formData.entries());
		console.log(formDataObject);
		this.loadBtn = true;
		this.productService.create_product(formData)
		.pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			takeUntil(this.destroy$),
			finalize(() => (this.loadBtn = false))
		)
		.subscribe({
			next: (next) =>{
				console.log(next);
			},
			error: (err) =>{
				this.errorsProduct = {
					cover: [],
					miniature: [],
				};
				const error = err.error;
				this.errorMsmServer = error.message || '¡Error desconocido!';
				toastr.error(this.errorMsmServer);
				console.log(error.validation);
				
				if (error.validation) {
					this.errorsProduct = {
						...this.errorsProduct,
						...error.validation, 
					};
					this.msmErrorProduct = Object.values(this.errorsProduct).flat();
					this.errorMsmServer = '';
				}
			}
		})
		
	}
}
