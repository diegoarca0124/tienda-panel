import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { PadCodePipe } from '@app/common/pipes/pad-code.pipe';
import { CategoryInterface, SubcategoryInterface } from '../../../interfaces/data.interface';

@Component({
	selector: 'app-move-products-category',
	imports: [CommonModule, PadCodePipe],
	templateUrl: './move-products-category.component.html',
	styleUrl: './move-products-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class MoveProductsCategoryComponent implements OnChanges {
	@Input() categories: CategoryInterface[] = [];
	@Input() currentCategoryId: string = '';
	@Input() selectedProductsCount: number = 0;
	@Input() isCategoriesLoading: boolean = false;
	@Input() isMovingProducts: boolean = false;
	@Input() movingToSubcategoryId: string | null = null;
	@Input() categoriesLoadError: Record<string, any> | null = null;

	@Output() refresh = new EventEmitter<void>();
	@Output() moveRequested = new EventEmitter<{ category: CategoryInterface; subcategory: SubcategoryInterface }>();

	expandedCategoryIndex: number | null = null;

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['categories'] || changes['currentCategoryId']) {
			const currentIndex = this.categories.findIndex((category) => category.id === this.currentCategoryId);
			this.expandedCategoryIndex = currentIndex >= 0 ? currentIndex : null;
		}
	}

	toggleCategory(index: number): void {
		this.expandedCategoryIndex = this.expandedCategoryIndex === index ? null : index;
	}

}
