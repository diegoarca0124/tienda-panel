import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TinymceEditorComponent } from '@app/shared/tinymce-editor/tinymce-editor.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { basic_properties, full_properties } from './constants/properties-tinymce.constant';
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
		IconTrashComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: './create-product.component.html',
	styleUrl: './create-product.component.css',
})
export class CreateProductComponent {
	public product: Product = {
		name: '',
		slug: '',
		type: 'Fisico',
		description: '',
		extract: '',
		cover: undefined as File | undefined,
		miniature: undefined as File | undefined,
		onSale: false,
		freeShipping: false,
		priceRegular: '',
		priceDiscount: '',
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
		weight: '',
		visibility: visibilities[0].name,
		status: statusProduct[0].name,
		mainAttribute: undefined,
		mainAttributeValue: undefined,
		unitOfMeasure: undefined,
		condition: undefined,
		warranty: undefined,
		tags: []
	};

	public errorsProduct: any = {
		cover: [],
		miniature: [],
	};


	public physical = {
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
		idRequiresRefrigeration: false,
		isFlammable: false,
		isRequiresAssembly: false,
		material: undefined,
		storageTempUnit: undefined,
		minStorageTemp: '',
		maxStorageTemp: ''
	}
	public shipping = {
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
	public variations : Array<{name: string, skuPattern: any | undefined}> = [];
	public images : Array<{file: File, preview: string, index: number}> = [];
	public cover : {file: File, preview: string, index: number} | undefined = undefined;
	public widthScreen : number = window.innerWidth;
	public skuPatterns = skuPatterns;
	
	constructor(
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private brandService: BrandService,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit(
		
	) {
		this.init_categories();
		this.init_brands();
		this.init_attributes();
		this.visibilities_ = this.visibilities_.map((v:any) => ({
			...v,
			icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
		}));
		this.statusProduct_ = this.statusProduct_.map((v:any) => ({
			...v,
			icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
		}));
	}

	@HostListener('window:resize', [])
	onResize() {
		this.widthScreen = window.innerWidth;
		console.log(this.widthScreen);
	}

	init_categories() {
		this.loadingCategories = true;
		this.errorMsmSeverListCategories = '';
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
					this.errorMsmSeverListCategories = error;
				},
			});
	}

	init_attributes() {
		this.loadingAttributes = true;
		this.errorMsmSeverListAttributes = '';
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
					this.errorMsmSeverListAttributes = error;
				},
			});
	}

	init_brands() {
		this.loadingBrands = true;
		this.errorMsmSeverListBrands = '';
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
					this.errorMsmSeverListBrands = error;
				},
			});
	}

	init_subcategories(id: string | undefined) {
		this.loadingSubcategories = true;
		this.errorMsmSeverListSubcategories = '';
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
					this.errorMsmSeverListSubcategories = error;
				},
			});
	}

	init_valuesAttribute(id: string) {
		this.loadingValuesAttribute = true;
		this.errorMsmSeverListValuesAttribute = '';
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
					this.errorMsmSeverListValuesAttribute = error;
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


		console.log(this.images);
		setTimeout(() => {
			refreshFsLightbox();
		}, 50);
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
	
	addVariation(){
		console.log(this.variation);
		
		this.variations.push({...this.variation});
	}

	create() {
		console.log(this.product);
		console.log(this.physical);
		
	}
}
