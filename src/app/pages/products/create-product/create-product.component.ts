import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
		IconCheckComponent,
	],
	templateUrl: './create-product.component.html',
	styleUrl: './create-product.component.css',
})
export class CreateProductComponent {
	public product: Product = {
		name: '',
		slug: '',
		type: 'Fisico',
		description: '',
		cover: '',
		onSale: false,
		freeShipping: false,
		priceRegular: '',
		priceDiscount: '',
		brandId: '',
		categoryId: '',
		subcategoryId: '',
	};
	private destroy$ = new Subject<void>();
	public loadBtn = false;
	public properties = environment.tinymceSettings == 'basic' ? basic_properties : full_properties;
	public categories_ = [];
	public subcategories_ = [];
	public brands_: any = [];
	public categories: string = '';
	public categorySelected: any = undefined;
	public subcategorySelected: any = undefined;
	public brandSelected: any = undefined;
	public errorMsmSeverListCategories: string = '';
	public errorMsmSeverListSubcategories: string = '';
	public errorMsmSeverListBrands: string = '';
	public loadingBrands: boolean = true;
	public loadingCategories: boolean = true;
	public loadingSubcategories: boolean = false;
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

	constructor(
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private brandService: BrandService
	) {}

	ngOnInit() {
		this.init_categories();
		this.init_brands();
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
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmSeverListCategories = error;
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

	init_subcategories(id: string) {
		this.loadingSubcategories = true;
		this.errorMsmSeverListSubcategories = '';
		this.categoryService
			.get_subcategories_by_select(this.categorySelected)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadingSubcategories = false))
			)
			.subscribe({
				next: (next) => {
					console.log(next);
					this.subcategories_ = next;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmSeverListSubcategories = error;
				},
			});
	}

	onSelectCategory() {
		this.subcategorySelected = undefined;
		this.init_subcategories(this.categorySelected);
	}

	setOption(value: number) {
		this.option = value;
	}

	create() {}
}
