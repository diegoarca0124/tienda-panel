import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
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
import { configurationsFilters } from '../constants/configurations-filters.constant';
import { MenuSettingsCategoriesComponent } from '@app/shared/menu-settings-categories/menu-settings-categories.component';
import { GetCategoriesQPI } from '@app/pages/brands/interfaces/query-params.interface';
import { sortOptions } from '../constants/sort-categories-filters.constant';
import { statusOptions } from '../constants/status-filters.contant';
import { GetCategoriessRESI, UpdateCategoriesStatusRESI, UpdateCategoryStatusRESI } from '../interfaces/response.interface';
import { CategoryInterface } from '../interfaces/data.interface';
declare const toastr: any;
declare const $: any;

type CategoriesLoadResult = { data: GetCategoriessRESI; error: null } | { data: null; error: HttpErrorResponse };

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
	private destroy$ = new Subject<void>();
	private readonly categoriesQuery$ = new Subject<GetCategoriesQPI>();

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedSort: string = 'Predeterminado';
	public selectedConfigurations: any = 'Predeterminado';

	public currentPage: number = 1;
	public totalPages: number = 0;
	public limit: number = 10;

	public readonly statusFilters = statusOptions;
	public readonly sortFilters = sortOptions;

	public selectedCategoriesIds = new Set<string>();
	public isCategoriesLoading: boolean = true;
	public categoriesLoadError: string = '';

	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingMultipleStatuses: WritableSignal<boolean> = signal(false);

	public categories: CategoryInterface[] = [];
	public screenHeight = window.innerHeight;

	public readonly sortValues = sortOptions.map((item) => item.value);
	public readonly configurationsValues = configurationsFilters.map((item) => item.value);

	constructor(
		private router: Router,
		private categoryService: CategoryService,
		private route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this.listenCategoriesQueries();
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const validParams = validateCategoriesQueryParams(this.route, params, this.router, this.sortValues, this.configurationsValues);
			if (!validParams) return;
			this.loadQueryParams(params);
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

	private loadQueryParams(params: Params): void {
		this.filter = params['filter'] || '';
		this.currentPage = Number(params['page']);
		this.limit = Number(params['limit']);
		this.selectedStatus = params['status'];
		this.selectedSort = params['sort'];
		this.selectedConfigurations = params['configurations'];
	}

	private listenCategoriesQueries(): void {
		this.categoriesQuery$
			.pipe(
				switchMap((query) => {
					this.isCategoriesLoading = true;
					this.categoriesLoadError = '';
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
					this.categoriesLoadError = error.error;
					return;
				}
				if (!data) return;
				this.selectedCategoriesIds.clear();
				this.categories = this.mapCategories(data.categories);
				this.totalPages = data.meta.totalPages;
				this.syncCurrentPage(data.meta.currentPage);
			});
	}

	private refreshCategories(): void {
		this.categoryService
			.getCategories({
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.selectedStatus,
				sort: this.selectedSort,
				configurations: this.selectedConfigurations
			})
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response: GetCategoriessRESI) => {
					this.categories = this.mapCategories(response.categories);
					this.totalPages = response.meta.totalPages;
					this.syncCurrentPage(response.meta.currentPage);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error?.message || 'No fue posible actualizar la lista.');
				},
			});
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
			safeIcon: this.sanitizer.bypassSecurityTrustHtml(category.icon),
			latestProducts: category.latestProducts!.map((product) => ({
				...product,
				cover: `${environment.s3_public_url}/products/small/${product.cover}`,
			})),
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

	hasSelectedCategories(): boolean {
		return this.selectedCategoriesIds.size > 0;
	}

	onLimitChange() {
		this.currentPage = 1;
		this.applyFilters();
	}

	onPageChange(newPage: number): void {
		if (newPage === this.currentPage) return;
		this.currentPage = newPage;
		this.applyFilters();
	}

	onResetCurrentPage() {
		this.currentPage = 1;
	}

	clearCollaboratorSelection(): void {
		this.selectedCategoriesIds.clear();
	}

	selectAllCollaborators(): void {
		this.selectedCategoriesIds = new Set(this.categories.map((category) => category.id).filter((id): id is string => Boolean(id)));
	}

	get areAllCollaboratorsSelected(): boolean {
		return this.categories.length > 0 && this.categories.every((category) => Boolean(category.id) && this.selectedCategoriesIds.has(category.id!));
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
					toastr.error(error.error.message);
				},
			});
	}

	applyFilters() {
		const queryParams = {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			configurations: this.selectedConfigurations,
		};

		const current: any = this.route.snapshot.queryParams;

		const same =
			(current.filter ?? '') === queryParams.filter &&
			Number(current.page) === queryParams.page &&
			Number(current.limit) === queryParams.limit &&
			(current.status ?? 'Todos') === queryParams.status &&
			(current.sort ?? 'Predeterminado') === queryParams.sort &&
			(current.configurations ?? 'Predeterminado') === queryParams.configurations;
		console.log(queryParams);

		if (same) {
			this.loadCategories();
			return;
		}

		this.router.navigate([], {
			queryParams,
		});
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

	toggleItem(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			this.selectedCategoriesIds.add(id);
		} else {
			this.selectedCategoriesIds.delete(id);
		}
	}

	getSelectedIds(): string[] {
		return [...this.selectedCategoriesIds];
	}

	onUpdateStatusMultiple(status: boolean) {
		this.isUpdatingMultipleStatuses.set(true);
		this.categoryService
			.updateCategoriesStatus({
				ids: this.getSelectedIds(),
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
					toastr.error(error.error.message);
				},
			});
	}
}
