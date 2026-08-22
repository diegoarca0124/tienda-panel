import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, DragDropModule, transferArrayItem } from '@angular/cdk/drag-drop';
import { CategoryInterface } from '../interfaces/category.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
declare const toastr: any;

@Component({
	selector: 'app-mapping-category',
	imports: [RouterModule, CommonModule, SidebarComponent, TopbarComponent, NotFoundComponent, DragDropModule],
	templateUrl: './mapping-category.component.html',
	styleUrl: './mapping-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MappingCategoryComponent {
	public categories: CategoryInterface[] = [];
	private destroy$ = new Subject<void>();
	public loading: boolean = true;
	public errorMsmServerListCategories: string = '';
	public dropListIds: string[] = [];
	public dragOverCategoryId: string | undefined = undefined;
	public loadingMove: boolean = false;
	public categoryDestination: string | undefined = undefined;

	constructor(
		private categoryService: CategoryService,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this.initCategories();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getDropListIds(currentCategoryId: string): string[] {
		return this.categories.filter((category) => category.id !== currentCategoryId).map((category) => 'category-' + category.id);
	}

	drop(event: CdkDragDrop<any>) {
		if (this.loadingMove) return;
		if (event.previousContainer === event.container) return;

		const previousCategory = event.previousContainer.data;
		const currentCategory = event.container.data;
		const subcategory = event.item.data;
		let data = {
			categoryId: currentCategory.id,
		};

		this.categoryDestination = currentCategory.id;
		this.loadingMove = true;
		this.dragOverCategoryId = undefined;
		this.categoryService
			.update_category_in_subcategory(subcategory.id, data)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.loadingMove = false;
					this.categoryDestination = undefined;
				})
			)
			.subscribe({
				next: (next: { message: string }) => {
					toastr.success(next.message);
					transferArrayItem(previousCategory.subcategories, currentCategory.subcategories, event.previousIndex, event.currentIndex);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');
				},
			});
	}

	initCategories() {
		this.loading = true;
		this.errorMsmServerListCategories = '';
		this.categories = [];
		this.categoryService
			.get_categories_with_subcategories()
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { data: CategoryInterface[]; message: string }) => {
					this.categories = next.data.map((i) => ({
						...i,
						safeIcon: this.sanitizer.bypassSecurityTrustHtml(i.icon),
					}));
					this.dropListIds = this.categories.map((category: CategoryInterface) => 'category-' + category.id);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.errorMsmServerListCategories = error;
				},
			});
	}
}
