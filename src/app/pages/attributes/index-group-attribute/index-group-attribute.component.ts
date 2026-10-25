import { getHttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { AttributeService } from '@app/services/attribute.service';
import { CategoryService } from '@app/services/category.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, finalize, map, of, Subject, switchMap, takeUntil } from 'rxjs';
import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { GetAttributesGroupsQPI } from '../interfaces/query-params.interface';
import { GetAttributesGroupsRESI, UpdateAttributeGroupStatusRESI, UpdateAttributeGroupsStatusRESI } from '../interfaces/response.interface';
import { sortOptions, statusOptions } from '../constants/selectors.constant';
import { validateAttributesGroupsQueryParams } from '../utils/validate-attributes-groups-query-params.util';
declare const toastr: any;

type AttributeGroupsLoadResult = { data: GetAttributesGroupsRESI; error: null } | { data: null; error: HttpErrorResponse };

@Component({
	selector: 'app-index-group-attribute',
	imports: [TopbarComponent, SidebarComponent, CommonModule, RouterModule, FormsModule, PaginationComponent, NotFoundComponent, ModalDeleteComponent, NgSelectModule],
	templateUrl: './index-group-attribute.component.html',
	styleUrl: './index-group-attribute.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IndexGroupAttributeComponent {
	public readonly paginationLimits = PAGINATION_LIMITS;
	private destroy$ = new Subject<void>();
	private readonly attributeGroupsQuery$ = new Subject<GetAttributesGroupsQPI>();

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedSort: string = 'Predeterminado';
	public selectedCategories: string = 'Todos';
	public selectedCategoryIds: string[] = [];
	public categoryFilters: { id: string; name: string }[] = [];
	public isCategoriesLoading: boolean = true;

	public currentPage: number = 1;
	public totalPages: number = 0;
	public totalAttributeGroups: number = 0;
	public limit: number = 10;

	public readonly statusFilters = statusOptions;
	public readonly sortFilters = sortOptions;

	public selectedAttributeGroupsIds = new Set<string>();
	public readonly maxSelectedAttributeGroups = 20;
	public isAttributeGroupsLoading: boolean = true;
	public attributeGroupsLoadError: Record<string, any> | null = null;

	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingMultipleStatuses: WritableSignal<boolean> = signal(false);

	public attributeGroups: AttributeGroupInterface[] = [];

	constructor(
		private router: Router,
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private route: ActivatedRoute
	) {}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	ngOnInit() {
		this.loadCategoryFilters();
		this.listenAttributeGroupsQueries();
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const { isValid, queryParams } = validateAttributesGroupsQueryParams(params);
			if (!isValid) {
				this.router.navigate([], {
					relativeTo: this.route,
					queryParams,
					replaceUrl: true,
				});
				return;
			}
			this.loadQueryParams(queryParams);
			this.loadAttributeGroups();
		});
	}

	private loadAttributeGroups(): void {
		this.attributeGroupsQuery$.next({
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
			categories: this.selectedCategories,
		});
	}

	private listenAttributeGroupsQueries(): void {
		this.attributeGroupsQuery$
			.pipe(
				switchMap((query) => {
					this.isAttributeGroupsLoading = true;
					this.attributeGroupsLoadError = null;
					this.clearAttributeGroupsTable();
					return this.attributeService.getAttributesGroups(query).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						map(
							(data): AttributeGroupsLoadResult => ({
								data,
								error: null,
							})
						),
						catchError((error: HttpErrorResponse) =>
							of<AttributeGroupsLoadResult>({
								data: null,
								error,
							})
						)
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe(({ data, error }) => {
				this.isAttributeGroupsLoading = false;
				if (error) {
					this.clearAttributeGroupsTable();
					this.attributeGroupsLoadError = getHttpErrorBody(error);
					return;
				}
				if (!data) return;
				this.selectedAttributeGroupsIds.clear();
				this.attributeGroups = data.attributeGroups;
				this.totalPages = data.meta.totalPages;
				this.totalAttributeGroups = data.meta.totalAttributesGroups;
				this.syncCurrentPage(data.meta.currentPage);
			});
	}

	private clearAttributeGroupsTable(): void {
		this.attributeGroups = [];
		this.totalAttributeGroups = 0;
		this.totalPages = 0;
		this.selectedAttributeGroupsIds.clear();
	}

	get canUpdateSelectedAttributeGroups(): boolean {
		return (
			!this.isAttributeGroupsLoading &&
			!this.attributeGroupsLoadError &&
			!this.isUpdatingMultipleStatuses() &&
			!this.isUpdatingSingleStatus() &&
			this.selectedAttributeGroupsIds.size > 0 &&
			this.selectedAttributeGroupsIds.size <= this.maxSelectedAttributeGroups &&
			[...this.selectedAttributeGroupsIds].every((id) => this.attributeGroups.some((attributeGroup) => attributeGroup.id === id))
		);
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
				categories: this.selectedCategories,
			},
			replaceUrl: true,
		});
	}

	private loadQueryParams(params: GetAttributesGroupsQPI): void {
		this.filter = params.filter;
		this.currentPage = params.page;
		this.limit = params.limit;
		this.selectedStatus = params.status;
		this.selectedSort = params.sort;
		this.selectedCategories = params.categories;
		this.selectedCategoryIds = this.selectedCategories === 'Todos' ? [] : this.selectedCategories.split(',');
	}

	private loadCategoryFilters(): void {
		this.categoryService
			.get_categories_by_select()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isCategoriesLoading = false))
			)
			.subscribe({
				next: (response: { data: { id: string; name: string }[] }) => {
					this.categoryFilters = response.data;
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(getHttpErrorBody(error, 'No fue posible cargar las categorías.').message);
				},
			});
	}

	private refreshAttributeGroups(): void {
		this.loadAttributeGroups();
	}

	getCategories(categories: string[]): void {
		this.selectedCategoryIds = [...categories];
		this.selectedCategories = categories.join(',') || 'Todos';
	}

	get firstVisibleAttributeGroup(): number {
		if (this.totalAttributeGroups === 0 || this.attributeGroups.length === 0) return 0;
		return (this.currentPage - 1) * this.limit + 1;
	}

	get lastVisibleAttributeGroup(): number {
		if (this.totalAttributeGroups === 0 || this.attributeGroups.length === 0) return 0;
		return Math.min(this.firstVisibleAttributeGroup + this.attributeGroups.length - 1, this.totalAttributeGroups);
	}

	onAttributeGroupsSelectionChange(id: string, checked: boolean): void {
		if (!id || this.isAttributeGroupsLoading || this.attributeGroupsLoadError) return;
		if (checked) {
			if (!this.selectedAttributeGroupsIds.has(id) && this.selectedAttributeGroupsIds.size >= this.maxSelectedAttributeGroups) return;
			this.selectedAttributeGroupsIds.add(id);
		} else {
			this.selectedAttributeGroupsIds.delete(id);
		}
	}

	get hasSelectedAttributeGroups(): boolean {
		return this.selectedAttributeGroupsIds.size > 0;
	}

	clearAttributeGroupsSelection(): void {
		this.selectedAttributeGroupsIds.clear();
	}

	selectAllAttributeGroups(): void {
		if (this.isAttributeGroupsLoading || this.attributeGroupsLoadError) return;
		const ids = [...new Set(this.attributeGroups.map((group) => group.id).filter((id): id is string => Boolean(id)))];
		for (const id of ids) {
			if (this.selectedAttributeGroupsIds.size >= this.maxSelectedAttributeGroups) break;
			this.selectedAttributeGroupsIds.add(id);
		}
		if (ids.some((id) => !this.selectedAttributeGroupsIds.has(id))) {
			toastr.info(`Puedes seleccionar un máximo de ${this.maxSelectedAttributeGroups} registros.`);
		}
	}

	get areAllAttributeGroupsSelected(): boolean {
		return this.attributeGroups.length > 0 && this.attributeGroups.every((group) => Boolean(group.id) && this.selectedAttributeGroupsIds.has(group.id!));
	}

	onLimitChange() {
		this.applyFilters(true);
	}

	onPageChange(newPage: number): void {
		if (newPage === this.currentPage) return;

		this.currentPage = newPage;
		this.applyFilters(false);
	}

	resetFilters() {
		this.filter = '';
		this.selectedStatus = 'Todos';
		this.selectedSort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;
		this.selectedCategories = 'Todos';
		this.selectedCategoryIds = [];

		this.router.navigate([], {
			queryParams: {
				filter: null,
				page: 1,
				limit: 10,
				status: null,
				sort: null,
				categories: null,
			},
			queryParamsHandling: 'merge',
		});
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
			categories: this.selectedCategories,
		};

		const current = this.route.snapshot.queryParams;

		const same =
			(current['filter'] ?? '') === queryParams.filter &&
			Number(current['page'] ?? 1) === queryParams.page &&
			Number(current['limit'] ?? 10) === queryParams.limit &&
			(current['status'] ?? 'Todos') === queryParams.status &&
			(current['sort'] ?? 'Predeterminado') === queryParams.sort &&
			(current['categories'] ?? 'Todos') === queryParams.categories;

		if (same) {
			this.loadAttributeGroups();
			return;
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams,
		});
	}

	onUpdateStatus(id: string, status: boolean) {
		this.isUpdatingSingleStatus.set(true);
		this.attributeService
			.updateAttributeGroupStatus(id, { status: !status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingSingleStatus.set(false))
			)
			.subscribe({
				next: (next: UpdateAttributeGroupStatusRESI) => {
					toastr.success(next.message);
					closeModal(`modalDelete-${id}`);
					this.refreshAttributeGroups();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message);
				},
			});
	}

	onUpdateStatusMultiple(status: boolean) {
		if (!this.canUpdateSelectedAttributeGroups) return;
		this.isUpdatingMultipleStatuses.set(true);
		this.attributeService
			.updateAttributeGroupsStatus({
				ids: [...this.selectedAttributeGroupsIds],
				status,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingMultipleStatuses.set(false))
			)
			.subscribe({
				next: (next: UpdateAttributeGroupsStatusRESI) => {
					toastr.success(next.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedAttributeGroupsIds.clear();
					this.refreshAttributeGroups();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message);
				},
			});
	}
}
