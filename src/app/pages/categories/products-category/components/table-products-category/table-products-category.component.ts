import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { CurrencySymbolPipe } from '@app/common/pipes/currency-symbol.pipe';
import { PadCodePipe } from '@app/common/pipes/pad-code.pipe';
import { ProductInterface } from '@app/pages/products/interfaces/product.interface';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';

@Component({
	selector: 'app-table-products-category',
	imports: [CommonModule, FormsModule, RouterModule, NotFoundComponent, PaginationComponent, FallbackImageDirective, PadCodePipe, CurrencySymbolPipe],
	templateUrl: './table-products-category.component.html',
	styleUrl: './table-products-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TableProductsCategoryComponent {
	readonly paginationLimits = PAGINATION_LIMITS;
	@Input() products: ProductInterface[] = [];
	@Input() isLoading: boolean = false;
	@Input() loadError: Record<string, any> | null = null;
	@Input() selectedProductsIds = new Set<string>();
	@Input() currentPage: number = 1;
	@Input() totalPages: number = 0;
	@Input() limit: number = 10;

	@Output() productSelectionChange = new EventEmitter<{ id: string; event: Event }>();
	@Output() productMoveRequested = new EventEmitter<string>();
	@Output() pageChanged = new EventEmitter<number>();
	@Output() limitChanged = new EventEmitter<number>();

	readonly qualityLabels: Record<string, string> = {
		low: 'Baja',
		medium: 'Media',
		high: 'Alta',
	};

	toggleProduct(id: string, event: Event): void {
		this.productSelectionChange.emit({ id, event });
	}

	onLimitChange(): void {
		this.limitChanged.emit(this.limit);
	}
}
