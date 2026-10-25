import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryWithSubcategoriesRESI, MappingSubcategoryInterface } from '@app/pages/categories/interfaces/response.interface';
import { qualityOptions, sortOptions, statusOptions, visibilityOptions } from '@app/pages/products/constants/selectors.constant';
import { InputDialerComponent } from '@app/shared/input-dialer/input-dialer.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
	selector: 'app-sidebar-products-brand',
	imports: [CommonModule, FormsModule, NgSelectModule, NgbTooltipModule, InputDialerComponent],
	templateUrl: './sidebar-products-brand.component.html',
	styleUrl: './sidebar-products-brand.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarProductsBrandComponent implements OnChanges {
	@Input() isLoading = false;
	@Input() isCategoriesLoading = false;
	@Input() categories: CategoryWithSubcategoriesRESI[] = [];
	@Input() selectedStatus = 'Todos';
	@Output() selectedStatusChange = new EventEmitter<string>();
	@Input() selectedSort = 'Predeterminado';
	@Output() selectedSortChange = new EventEmitter<string>();
	@Input() selectedQuality = 'Todos';
	@Output() selectedQualityChange = new EventEmitter<string>();
	@Input() selectedVisibility = 'Todos';
	@Output() selectedVisibilityChange = new EventEmitter<string>();
	@Input() selectedSubcategoryIds = 'Todos';
	@Output() selectedSubcategoryIdsChange = new EventEmitter<string>();
	@Input() selectedCategoryIds = 'Todos';
	@Output() selectedCategoryIdsChange = new EventEmitter<string>();
	@Input() minPrice: number | null = null;
	@Output() minPriceChange = new EventEmitter<number | null>();
	@Input() maxPrice: number | null = null;
	@Output() maxPriceChange = new EventEmitter<number | null>();
	@Output() apply = new EventEmitter<void>();

	readonly statusFilters = statusOptions;
	readonly sortFilters = sortOptions;
	readonly qualityFilters = qualityOptions;
	readonly visibilityFilters = visibilityOptions;
	selectedSubcategoryValues: string[] = [];
	selectedCategoryValues: string[] = [];
	subcategories: MappingSubcategoryInterface[] = [];

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['selectedSubcategoryIds']) {
			this.selectedSubcategoryValues = this.toIds(this.selectedSubcategoryIds);
		}
		if (changes['selectedCategoryIds']) {
			this.selectedCategoryValues = this.toIds(this.selectedCategoryIds);
		}
		if (changes['categories'] || changes['selectedCategoryIds']) {
			this.updateSubcategories();
		}
	}

	private updateSubcategories(): void {
		const ids = new Set(this.selectedCategoryValues);
		this.subcategories = this.categories.filter((category) => !ids.size || ids.has(category.id)).flatMap((category) => category.subcategories);
	}

	get isSubcategoriesLoading(): boolean {
		return this.isCategoriesLoading;
	}

	onSubcategoriesChange(ids: string[] | null): void {
		this.selectedSubcategoryValues = [...(ids ?? [])];
		this.selectedSubcategoryIds = this.selectedSubcategoryValues.join(',') || 'Todos';
		this.selectedSubcategoryIdsChange.emit(this.selectedSubcategoryIds);
	}

	onCategoriesChange(ids: string[] | null): void {
		this.selectedCategoryValues = [...(ids ?? [])];
		this.selectedCategoryIds = this.selectedCategoryValues.join(',') || 'Todos';
		this.selectedCategoryIdsChange.emit(this.selectedCategoryIds);
		this.updateSubcategories();
		const allowedIds = new Set(this.subcategories.map((subcategory) => subcategory.id));
		this.onSubcategoriesChange(this.selectedSubcategoryValues.filter((id) => allowedIds.has(id)));
	}

	getSelectedSubcategoryNames(): string {
		return this.subcategories
			.filter((item) => this.selectedSubcategoryValues.includes(item.id))
			.map((item) => item.name)
			.join(', ');
	}

	getSelectedCategoryNames(): string {
		return this.categories
			.filter((item) => this.selectedCategoryValues.includes(item.id))
			.map((item) => item.name)
			.join(', ');
	}

	private toIds(value: string): string[] {
		return !value || value === 'Todos'
			? []
			: value
					.split(',')
					.map((id) => id.trim())
					.filter(Boolean);
	}
}
