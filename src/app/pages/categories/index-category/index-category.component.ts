import { getHttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { getColorBasedOnLetter } from '@app/common/utils/get-color-based-on-letter.util';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, finalize, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { validateCategoriesQueryParams } from '../utils/validate-categories-query-params.util';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from '../../../common/pipes/pad-code.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { MenuSettingsCategoriesComponent } from '@app/shared/menu-settings-categories/menu-settings-categories.component';
import { GetCategoriesRESI, UpdateCategoriesStatusRESI, UpdateCategoryStatusRESI } from '../interfaces/response.interface';
import { CategoryInterface } from '../interfaces/data.interface';
import { GetCategoriesQPI } from '../interfaces/query-params.interface';
import { sortOptions, statusOptions } from '../constants/selectors.constant';
import { CATEGORY_STATUS_DETAILS } from '../constants/category-status.constants';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
declare const toastr: any;
declare const $: any;

type CategoriesLoadResult = { data: GetCategoriesRESI; error: null } | { data: null; error: HttpErrorResponse };

@Component({
	selector: 'app-index-category',
	imports: [
		TopbarComponent,
		SidebarComponent,
		CommonModule,
		RouterModule,
		FormsModule,
		ModalDeleteComponent,
		PaginationComponent,
		NotFoundComponent,
		NgSelectModule,
		NgbTooltipModule,
		FallbackImageDirective,
		PadCodePipe,
		MenuSettingsCategoriesComponent,
	],
	templateUrl: './index-category.component.html',
	styleUrl: './index-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IndexCategoryComponent {
	public readonly paginationLimits = PAGINATION_LIMITS;
	private destroy$ = new Subject<void>();
	private readonly categoriesQuery$ = new Subject<GetCategoriesQPI>();

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedSort: string = 'Predeterminado';
	public selectedConfigurations: string = 'Predeterminado';

	public currentPage: number = 1;
	public totalPages: number = 0;
	public totalCategories: number = 0;
	public limit: number = 10;

	public readonly statusFilters = statusOptions;
	public readonly sortFilters = sortOptions;
	public readonly categoryStatusDetails = CATEGORY_STATUS_DETAILS;

	public selectedCategoriesIds = new Set<string>();
	public readonly maxSelectedCategories = 20;
	public isCategoriesLoading: boolean = true;
	public categoriesLoadError: Record<string, any> | null = null;

	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingMultipleStatuses: WritableSignal<boolean> = signal(false);

	public categories: CategoryInterface[] = [];
	public screenHeight = window.innerHeight;

	constructor(
		private router: Router,
		private categoryService: CategoryService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this.listenCategoriesQueries();
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const { isValid, queryParams } = validateCategoriesQueryParams(params);
			if (!isValid) {
				this.router.navigate([], {
					relativeTo: this.route,
					queryParams,
					replaceUrl: true,
				});
				return;
			}
			this.loadQueryParams(queryParams);
			this.loadCategories();
		});
	}

	@HostListener('window:resize', [])
	onResize() {
		this.screenHeight = window.innerHeight;
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadQueryParams(params: GetCategoriesQPI): void {
		this.filter = params.filter;
		this.currentPage = params.page;
		this.limit = params.limit;
		this.selectedStatus = params.status;
		this.selectedSort = params.sort;
		this.selectedConfigurations = params.configurations;
	}

	private listenCategoriesQueries(): void {
		this.categoriesQuery$
			.pipe(
				switchMap((query) => {
					this.isCategoriesLoading = true;
					this.categoriesLoadError = null;
					this.clearCategoriesTable();
					return this.categoryService.getCategories(query).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						map(
							(data): CategoriesLoadResult => ({
								data,
								error: null,
							})
						),
						catchError((error: HttpErrorResponse) =>
							of<CategoriesLoadResult>({
								data: null,
								error,
							})
						)
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe(({ data, error }) => {
				this.isCategoriesLoading = false;
				if (error) {
					this.clearCategoriesTable();
					this.categoriesLoadError = getHttpErrorBody(error);
					return;
				}
				if (!data) return;
				this.selectedCategoriesIds.clear();
				this.categories = this.mapCategories(data.categories);
				this.totalPages = data.meta.totalPages;
				this.totalCategories = data.meta.totalCategories;
				this.syncCurrentPage(data.meta.currentPage);
			});
	}

	private refreshCategories(): void {
		this.loadCategories();
	}

	private clearCategoriesTable(): void {
		this.categories = [];
		this.totalCategories = 0;
		this.totalPages = 0;
		this.selectedCategoriesIds.clear();
	}

	get canUpdateSelectedCategories(): boolean {
		return !this.isCategoriesLoading && !this.categoriesLoadError && !this.isUpdatingMultipleStatuses() && !this.isUpdatingSingleStatus()
			&& this.selectedCategoriesIds.size > 0
			&& this.selectedCategoriesIds.size <= this.maxSelectedCategories
			&& [...this.selectedCategoriesIds].every((id) => this.categories.some((category) => category.id === id));
	}

	syncCurrentPage(currentPage: number): void {
		if (this.currentPage === currentPage) return;

		this.currentPage = currentPage;

		this.router.navigate([], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.selectedStatus,
				sort: this.selectedSort,
				configurations: this.selectedConfigurations,
			},
			replaceUrl: true,
		});
	}

	private loadCategories(): void {
		this.categoriesQuery$.next({
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			configurations: this.selectedConfigurations,
		});
	}

	private mapCategories(categories: CategoryInterface[]): CategoryInterface[] {
		return categories.map((category) => ({
			...category,
			safeIcon: this.sanitizer.bypassSecurityTrustHtml(category.icon || ''),
			latestProducts: (category.latestProducts ?? []).map((product) => ({
				...product,
				cover: product.cover ? `${environment.s3_public_url}/products/small/${product.cover}` : '',
			})),
			totalProducts: category.totalProducts ?? 0,
			moreProducts: category.moreProducts ?? 0,
		}));
	}

	getColorBasedOnLetter(str: string) {
		return getColorBasedOnLetter(str);
	}

	getConfigurations(configurations: any) {
		if (configurations.length >= 1) {
			this.selectedConfigurations = configurations.join(',');
		} else {
			this.selectedConfigurations = 'Predeterminado';
		}
	}

	applyFilters(resetPage: boolean = true): void {
		if (resetPage) {
			this.currentPage = 1;
		}

		const normalizedFilter = typeof this.filter === 'string' ? this.filter.trim().slice(0, 50) : '';

		this.filter = normalizedFilter;

		const queryParams = {
			filter: normalizedFilter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			configurations: this.selectedConfigurations,
		};

		const current = this.route.snapshot.queryParams;

		const same =
			(current['filter'] ?? '') === queryParams.filter &&
			Number(current['page'] ?? 1) === queryParams.page &&
			Number(current['limit'] ?? 10) === queryParams.limit &&
			(current['status'] ?? 'Todos') === queryParams.status &&
			(current['sort'] ?? 'Predeterminado') === queryParams.sort &&
			(current['configurations'] ?? 'Predeterminado') === queryParams.configurations;

		if (same) {
			this.loadCategories();
			return;
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams,
		});
	}

	onUpdateStatus(id: string, status: boolean) {
		this.isUpdatingSingleStatus.set(true);
		this.categoryService
			.updateCategoryStatus(id, { status: !status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingSingleStatus.set(false))
			)
			.subscribe({
				next: (next: UpdateCategoryStatusRESI) => {
					toastr.success(next.message);
					closeModal(`modalDelete-${id}`);
					this.refreshCategories();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message);
				},
			});
	}

	onLimitChange() {
		this.applyFilters(true);
	}

	onPageChange(newPage: number): void {
		if (newPage === this.currentPage) return;

		this.currentPage = newPage;
		this.applyFilters(false);
	}

	onResetCurrentPage() {
		this.currentPage = 1;
	}

	get hasSelectedCategories(): boolean {
		return this.selectedCategoriesIds.size > 0;
	}

	get firstVisibleCategory(): number {
		if (this.totalCategories === 0 || this.categories.length === 0) return 0;
		return (this.currentPage - 1) * this.limit + 1;
	}

	get lastVisibleCategory(): number {
		if (this.totalCategories === 0 || this.categories.length === 0) return 0;
		return Math.min(this.firstVisibleCategory + this.categories.length - 1, this.totalCategories);
	}

	clearCategorySelection(): void {
		this.selectedCategoriesIds.clear();
	}

	selectAllCategories(): void {
		if (this.isCategoriesLoading || this.categoriesLoadError) return;
		const ids = [...new Set(this.categories.map((category) => category.id).filter((id): id is string => Boolean(id)))];
		for (const id of ids) {
			if (this.selectedCategoriesIds.size >= this.maxSelectedCategories) break;
			this.selectedCategoriesIds.add(id);
		}
		if (ids.some((id) => !this.selectedCategoriesIds.has(id))) {
			toastr.info(`Puedes seleccionar un máximo de ${this.maxSelectedCategories} registros.`);
		}
	}

	get areAllCategoriesSelected(): boolean {
		return this.categories.length > 0 && this.categories.every((category) => Boolean(category.id) && this.selectedCategoriesIds.has(category.id!));
	}

	resetFilters() {
		this.filter = '';
		this.selectedStatus = 'Todos';
		this.selectedSort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;
		this.selectedConfigurations = 'Predeterminado';

		this.router.navigate([], {
			queryParams: {
				filter: null,
				page: 1,
				limit: 10,
				status: null,
				sort: null,
				configurations: null,
			},
			queryParamsHandling: 'merge',
		});
	}

	onCategorySelectionChange(id: string, checked: boolean): void {
		if (!id || this.isCategoriesLoading || this.categoriesLoadError) return;
		if (checked) {
			if (!this.selectedCategoriesIds.has(id) && this.selectedCategoriesIds.size >= this.maxSelectedCategories) return;
			this.selectedCategoriesIds.add(id);
		} else {
			this.selectedCategoriesIds.delete(id);
		}
	}

	onUpdateStatusMultiple(status: boolean) {
		if (!this.canUpdateSelectedCategories) return;
		this.isUpdatingMultipleStatuses.set(true);
		this.categoryService
			.updateCategoriesStatus({
				ids: [...this.selectedCategoriesIds],
				status,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingMultipleStatuses.set(false))
			)
			.subscribe({
				next: (next: UpdateCategoriesStatusRESI) => {
					toastr.success(next.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedCategoriesIds.clear();
					this.refreshCategories();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message);
				},
			});
	}
}
