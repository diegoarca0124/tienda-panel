import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, Inject, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { AttributeService } from '@app/services/attribute.service';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '@app/services/category.service';
import { BrandService } from '@app/services/brand.service';
import { labels } from '@app/common/constants/labels.constant';


import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { visibilities } from '../constants/visibilities.constant';
import { statusProduct } from '../constants/status-product.contant';

import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { productFormHelp } from '../constants/form-product-helper.constant';
import { PhysicalProduct } from '@app/common/interface/physical-product.interface';
import { ShippingProduct } from '@app/common/interface/shipping-product.interface';
import { ProductService } from '@app/services/product.service';
declare const toastr: any;

import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { createEmptyProduct, createEmptyProductPhysical, createEmptyProductShipping } from '../utils/empties.util';
import { PropertyInterface } from '../interfaces/property.interface';
import { GeneralCreateProductComponent } from '../components/general-create-product/general-create-product.component';
import { PropertyCreateProductComponent } from '../components/property-create-product/property-create-product.component';
import { ShippingCreateProductComponent } from '../components/shipping-create-product/shipping-create-product.component';
import { GalleryCreateProductComponent } from '../components/gallery-create-product/gallery-create-product.component';
import { VariationsCreateProductComponent } from '../components/variations-create-product/variations-create-product.component';
import { GroupCreateProductComponent } from '../components/group-create-product/group-create-product.component';
import { MenuCreateProductComponent } from '../components/menu-create-product/menu-create-product.component';
import { CharacteristicCreateProductComponent } from '../components/characteristic-create-product/characteristic-create-product.component';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { showErrorsProduct } from '../constants/show-errors-product.constant';
import { environment } from 'environments/environment.dev';
import { ProductInterface } from '../interfaces/product.interface';
import isEqual from 'lodash-es/isEqual';
import { ModalExitComponent } from '@app/shared/modal-exit/modal-exit.component';
import { ProductTabInterface } from '../interfaces/product-tab.interface';
import { CategoryInterface } from '../interfaces/category.interface';
import { SubcategoryInterface } from '../interfaces/subcategory.interface';
import { TextareaAutoresizeDirective } from '@app/common/directives/textarea-autoresize.directive';

@Component({
	selector: 'app-create-product',
	imports: [
		SidebarComponent,
		TopbarComponent,
		RouterModule,
		CommonModule,
		NgSelectModule,
		FormsModule,
		NgbTooltipModule,
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
		ModalExitComponent,
		TextareaAutoresizeDirective
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: './create-product.component.html',
	styleUrl: './create-product.component.css',
})
export class CreateProductComponent {
	@ViewChild('characteristics') characteristics!: CharacteristicCreateProductComponent;
	@ViewChild('gallery') gallery!: GalleryCreateProductComponent;
	@ViewChild('variations') variations!: VariationsCreateProductComponent;
	
	public product: ProductInterface = createEmptyProduct();
	private initialProduct = createEmptyProduct();
	public physical : PhysicalProduct = createEmptyProductPhysical();
	public shipping : ShippingProduct = createEmptyProductShipping();
	public errorsProduct: any = {};
	public variation = {
		skuPattern: undefined,
		name: ''
	}
	public labelHelper = productFormHelp;
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public categories : CategoryInterface[] = [];
	public visibilities : any = visibilities;
	public statusProduct : any = statusProduct;
	
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
	public tab : ProductTabInterface = 'general';
	public attributes : any[] = [];
	public images : Array<{file: File, preview: string, index: number}> = [];
	public widthScreen : number = window.innerWidth;
	public errorMsmServer: string = '';
	public msmErrorProduct: any = [];
	public loadImport : boolean = false;
	public categorySelected : any = {};
	public formData = new FormData();
	public showErrors = showErrorsProduct;
	
	@ViewChildren(NgSelectComponent) selects!: QueryList<NgSelectComponent>;
	
	constructor(
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private brandService: BrandService,
		private sanitizer: DomSanitizer,
		private productService: ProductService,
		private route: ActivatedRoute,
		private _router: Router
	) {}

	ngOnInit(
		
	) {
		const tab = this.route.snapshot.queryParamMap.get('tab');

		const validTabs: ProductTabInterface[] = [
			'general',
			'characteristics',
			'properties',
			'shipping',
			'images',
			'variations',
			'groups'
		];

		this.tab = validTabs.includes(tab as ProductTabInterface)
			? (tab as ProductTabInterface)
			: 'general';

		this.init_categories();
		this.init_brands();
		this.visibilities = this.visibilities.map((v:any) => ({
			...v,
			icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
		}));
		this.statusProduct = this.statusProduct.map((v:any) => ({
			...v,
			icon: this.sanitizer.bypassSecurityTrustHtml(v.icon)
		}));
		
	}

	hasPendingChanges(): boolean {
		return !isEqual(this.product, this.initialProduct);
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	@HostListener('window:beforeunload', ['$event'])
	onBeforeUnload(event: BeforeUnloadEvent) {
		const hasChanges = !isEqual(this.product, this.initialProduct);
		if (hasChanges) {
			event.preventDefault();
			event.returnValue = '';
		}

	}

	@HostListener('window:resize', [])
	onResize() {
		this.widthScreen = window.innerWidth;
		console.log(this.widthScreen);
	}

	init_categories() {
		this.loadingCategories = true;
		this.errorMsmSeverListCategories = '';
		this.categories = [];
		this.categoryService
			.get_categories_by_select()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingCategories = false))
			)
			.subscribe({
				next: (next: { data: CategoryInterface[], message: string}) => {
					this.categories = next.data;
					this.categories = this.categories.map((v:any) => ({
						...v,
						icon: this.sanitizer.bypassSecurityTrustHtml(v.icon ? v.icon : '')
					}));
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmSeverListCategories = error.message;
				},
			});
	}

	init_brands() {
		this.loadingBrands = true;
		this.errorMsmSeverListBrands = '';
		this.brands = [];
		this.brandService
			.get_brands_by_select()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingBrands = false))
			)
			.subscribe({
				next: (next) => {
					this.brands = next;
					this.brands = this.brands.map((brand : any) => ({
						...brand,
						logoUrl: `${environment.s3_public_url}/brands/small/${brand.logoUrl}`,
					}));
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
		this.subcategories = [];
		this.categoryService
			.get_subcategories_by_select(id!)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingSubcategories = false))
			)
			.subscribe({
				next: (next: {data: SubcategoryInterface[], message: string}) => {
					this.subcategories = next.data;
					this.subcategories = this.subcategories.map((v:any) => ({
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
		this.categorySelected = this.categories.find((item:any)=> item.id == this.product.categoryId);
		this.product.subcategoryId = undefined;
		this.init_subcategories(this.product.categoryId);
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
					/* loadingValuesAttribute */
					this.product = {
						...this.product,  
						...next.product, 
					};

					/* if (next.product.description) {
						this.quill.root.innerHTML = next.product.description;
					} */

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

	private appendIf(formData: FormData, key: string, value: any): void {
		if (value !== undefined &&value !== null &&value !== '') {
			formData.append(key, String(value));
		}
	}

	private appendJsonIf(formData: FormData, key: string, value: any): void {
		if (value !== undefined && value !== null) {
			formData.append(key, JSON.stringify(value));
		}
	}

	private appendProductData(formData: FormData): void {
		
		this.appendIf(formData, 'status', this.product.status);
		this.appendIf(formData, 'visibility', this.product.visibility);
		this.appendIf(formData, 'name', this.product.name);
		this.appendIf(formData, 'type', this.product.type);
		this.appendIf(formData, 'description', this.product.description);
		this.appendIf(formData, 'extract', this.product.extract);
		this.appendIf(formData, 'cover', this.product.cover);
		this.appendIf(formData, 'miniature', this.product.miniature);
		this.appendJsonIf(formData, 'unitOfMeasure', this.product.unitOfMeasure);
		this.appendIf(formData, 'condition', this.product.condition);
		this.appendIf(formData, 'warranty', this.product.warranty);

		this.appendJsonIf(formData, 'countryOfOrigin', this.product.countryOfOrigin);

		this.appendIf(formData, 'priceRegular', this.product.priceRegular);
		this.appendIf(formData, 'priceDiscount', this.product.priceDiscount);
		this.appendIf(formData, 'minStock', this.product.minStock);
		this.appendIf(formData, 'maxStock', this.product.maxStock);
		this.appendIf(formData, 'maxOrderLimit', this.product.maxOrderLimit);

		this.appendJsonIf(formData, 'tags', this.product.tags);

		this.appendIf(formData, 'brandId', this.product.brandId);
		this.appendIf(formData, 'categoryId', this.product.categoryId);
		this.appendIf(formData, 'subcategoryId', this.product.subcategoryId);
		this.appendIf(formData, 'productGroupId', this.product.productGroupId);

		this.appendIf(formData, 'isBestSeller', this.product.isBestSeller);
		this.appendIf(formData, 'isNewArrival', this.product.isNewArrival);
		this.appendIf(formData, 'isFeatured', this.product.isFeatured);
		this.appendIf(formData, 'isLimitedEdition', this.product.isLimitedEdition);
		this.appendIf(formData, 'isPreOrder', this.product.isPreOrder);
		this.appendIf(formData, 'isExportable', this.product.isExportable);
		this.appendIf(formData, 'allowBackorder', this.product.allowBackorder);

		this.appendIf(formData, 'isDimensions', this.categorySelected.isDimensions);
		this.appendIf(formData, 'isTemperature', this.categorySelected.isTemperature);
		
	}

	private appendAttributesData(formData: FormData){
		const attributes = this.characteristics?.getAttributesSelected()
		.flatMap(group => group.attributes)
		.filter(attr =>
			Array.isArray(attr.attributeValueId) &&
			attr.attributeValueId.length > 0
		);

		const data = attributes?.flatMap(attr =>
		attr.attributeValueId.map((valueId: string) => ({
			attributeId: attr.id,
			attributeValueId: valueId,
			value:
			attr.attributeValues.find((v: any) => v.id === valueId)?.value ?? null,
		}))
		) ?? [];

		formData.append('attributes', JSON.stringify(data));
	}

	private appendPhysicalData(formData: FormData): void {
		console.log(this.physical);
		
		this.appendIf(formData, 'weight', this.physical.weight);
		this.appendIf(formData, 'height', this.physical.height);
		this.appendIf(formData, 'width', this.physical.width);
		this.appendIf(formData, 'length', this.physical.length);
		this.appendJsonIf(formData, 'weightUnit', this.physical.weightUnit);
		this.appendJsonIf(formData, 'dimensionUnit', this.physical.dimensionUnit);
		this.appendIf(formData, 'isFragile', this.physical.isFragile);
		this.appendIf(formData, 'isPerishable', this.physical.isPerishable);
		this.appendIf(formData, 'isEcoFriendly', this.physical.isEcoFriendly);
		this.appendIf(formData, 'isBiodegradable', this.physical.isBiodegradable);
		this.appendIf(formData, 'isHazardous', this.physical.isHazardous);
		this.appendIf(formData, 'isRequiresRefrigeration', this.physical.isRequiresRefrigeration);
		this.appendIf(formData, 'isFlammable', this.physical.isFlammable);
		this.appendIf(formData, 'isRequiresAssembly', this.physical.isRequiresAssembly);
		this.appendIf(formData, 'minStorageTemp', this.physical.minStorageTemp);
		this.appendIf(formData, 'maxStorageTemp', this.physical.maxStorageTemp);
		this.appendJsonIf(formData, 'storageTempUnit', this.physical.storageTempUnit);
		this.appendIf(formData, 'material', this.physical.material);
	}

	private appendGalleryData(formData: FormData){
		const gallery = this.gallery?.getImagesSelected();
		gallery.forEach((file: {file: File, preview: string, index: number}) => {
			formData.append('gallery', file.file);
		});
	}

	private appendShippingData(formData: FormData): void {
		this.appendIf(formData, 'packageType', this.shipping.packageType);
		this.appendIf(formData, 'handlingDays', this.shipping.handlingDays);
		this.appendIf(formData, 'freeShipping', this.shipping.freeShipping);
		this.appendIf(formData, 'pickupInStore', this.shipping.pickupInStore);
		this.appendIf(formData, 'specialInstructions', this.shipping.specialInstructions);
	}

	private appendVariationsData(formData: FormData): void {
		const variations = this.variations?.getVariationsSelected();
		this.appendJsonIf(formData, 'variations', variations);
	}

	create() {	
		this.formData = new FormData();	
		this.appendAttributesData(this.formData);
		this.appendProductData(this.formData);
		this.appendPhysicalData(this.formData);
		this.appendShippingData(this.formData);
		this.appendGalleryData(this.formData);
		this.appendVariationsData(this.formData);

		const formDataObject = Object.fromEntries(this.formData.entries());
		console.log(formDataObject);
		this.loadBtn = true;
		this.productService.create_product(this.formData)
		.pipe(
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			takeUntil(this.destroy$),
			finalize(() => (this.loadBtn = false))
		)
		.subscribe({
			next: (next) =>{
				this.errorsProduct = {};
				toastr.success(next.message);
				this._router.navigate(['/products/articles']);
			},
			error: (err) =>{
				this.errorsProduct = {};
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
					for (const key in this.showErrors) {
						this.showErrors[key as keyof typeof this.showErrors] =
						!!this.errorsProduct?.[key]?.length;
					}
				}
			}
		})
		
	}
}
