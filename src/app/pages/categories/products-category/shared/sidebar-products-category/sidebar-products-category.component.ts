import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrandSelectInterface, SubcategorySelectInterface } from '@app/pages/categories/interfaces/response.interface';
import { qualityOptions, sortOptions, statusOptions, visibilityOptions } from '@app/pages/products/constants/selectors.constant';
import { CategoryService } from '@app/services/category.service';
import { BrandService } from '@app/services/brand.service';
import { InputDialerComponent } from '@app/shared/input-dialer/input-dialer.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { finalize, Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-sidebar-products-category',
	imports: [CommonModule, FormsModule, NgSelectModule, NgbTooltipModule, InputDialerComponent],
	templateUrl: './sidebar-products-category.component.html',
	styleUrl: './sidebar-products-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarProductsCategoryComponent implements OnChanges, OnDestroy {
	@Input() isLoading: boolean = false;
	@Input() categoryId: string = '';
	@Input() selectedStatus: string = 'Todos';
	@Output() selectedStatusChange = new EventEmitter<string>();
	@Input() selectedSort: string = 'Predeterminado';
	@Output() selectedSortChange = new EventEmitter<string>();
	@Input() selectedQuality: string = 'Todos';
	@Output() selectedQualityChange = new EventEmitter<string>();
	@Input() selectedVisibility: string = 'Todos';
	@Output() selectedVisibilityChange = new EventEmitter<string>();
	@Input() selectedSubcategoryIds: string = 'Todos';
	@Output() selectedSubcategoryIdsChange = new EventEmitter<string>();
	@Input() selectedBrandIds: string = 'Todos';
	@Output() selectedBrandIdsChange = new EventEmitter<string>();
	@Input() minPrice: number | null = null;
	@Output() minPriceChange = new EventEmitter<number | null>();
	@Input() maxPrice: number | null = null;
	@Output() maxPriceChange = new EventEmitter<number | null>();
	@Output() apply = new EventEmitter<void>();

	readonly statusFilters = statusOptions;
	readonly sortFilters = sortOptions;
	readonly qualityFilters = qualityOptions;
	readonly visibilityFilters = visibilityOptions;

	subcategories: SubcategorySelectInterface[] = [];
	selectedSubcategoryValues: string[] = [];
	isSubcategoriesLoading: boolean = false;

	brands: BrandSelectInterface[] = [];
	selectedBrandValues: string[] = [];
	isBrandsLoading: boolean = false;

	private destroy$ = new Subject<void>();
	private readonly cancelSubcategoriesLoad$ = new Subject<void>();

	constructor(
		private categoryService: CategoryService,
		private brandService: BrandService
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedSubcategoryIds']) {
			this.selectedSubcategoryValues = this.toSubcategoryArray(this.selectedSubcategoryIds);
		}

		if (changes['selectedBrandIds']) {
			this.selectedBrandValues = this.toBrandArray(this.selectedBrandIds);
		}

		if (changes['categoryId'] && this.categoryId) {
			this.loadSubcategories();
			this.loadBrands();
		}
	}

	loadSubcategories(): void {
		this.cancelSubcategoriesLoad$.next();
		this.subcategories = [];
		this.isSubcategoriesLoading = true;
		this.categoryService
			.getSubcategoriesByCategorySelect(this.categoryId)
			.pipe(
				takeUntil(this.cancelSubcategoriesLoad$),
				takeUntil(this.destroy$),
				finalize(() => (this.isSubcategoriesLoading = false))
			)
			.subscribe({
				next: (response) => (this.subcategories = response.data),
				error: () => (this.subcategories = []),
			});
	}

	loadBrands(): void {
		this.isBrandsLoading = true;
		this.brandService
			.getBrandsSelect()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isBrandsLoading = false))
			)
			.subscribe({
				next: (response: BrandSelectInterface[]) => {
					this.brands = response;
				},
				error: () => (this.brands = []),
			});
	}

	onSubcategoriesChange(ids: string[] | null): void {
		this.selectedSubcategoryValues = ids ?? [];
		this.selectedSubcategoryIdsChange.emit(this.selectedSubcategoryValues.length ? this.selectedSubcategoryValues.join(',') : 'Todos');
	}

	onBrandsChange(ids: string[] | null): void {
		this.selectedBrandValues = ids ?? [];
		this.selectedBrandIdsChange.emit(this.selectedBrandValues.length ? this.selectedBrandValues.join(',') : 'Todos');
	}

	getSelectedSubcategoryNames(): string {
		const selectedIds = new Set(this.selectedSubcategoryValues);
		return this.subcategories
			.filter((subcategory) => selectedIds.has(subcategory.id))
			.map((subcategory) => subcategory.name)
			.join(', ');
	}

	getSelectedBrandNames(): string {
		const selectedIds = new Set(this.selectedBrandValues);
		return this.brands
			.filter((brand) => selectedIds.has(brand.id))
			.map((brand) => brand.name)
			.join(', ');
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.cancelSubcategoriesLoad$.complete();
	}

	private toSubcategoryArray(value: string): string[] {
		return !value || value === 'Todos'
			? []
			: value
					.split(',')
					.map((id) => id.trim())
					.filter(Boolean);
	}

	private toBrandArray(value: string): string[] {
		return !value || value === 'Todos'
			? []
			: value
					.split(',')
					.map((id) => id.trim())
					.filter(Boolean);
	}
}
