import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AttributeService } from '@app/services/attribute.service';
import { CategoryService } from '@app/services/category.service';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { filter, finalize, Subject, takeUntil } from 'rxjs';
import { AttributeGroupInterface } from '../interfaces/attribute-group.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { GLOBAL } from '@app/services/GLOBAL';
import { sortColumnsAttributes } from '../constants/sortColumnsAttributes.constant';
import { ValidateQPGroupsAttribute } from '../utils/validate-qp-groups-attributes.util';
import { closeModal } from '@app/common/utils/close-modal.util';
declare const toastr: any;

@Component({
	selector: 'app-index-group-attribute',
	imports: [TopbarComponent, SidebarComponent, CommonModule, RouterModule, FormsModule, PaginationComponent, NotFoundComponent, ModalDeleteComponent, NgSelectModule],
	templateUrl: './index-group-attribute.component.html',
	styleUrl: './index-group-attribute.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IndexGroupAttributeComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public loadBtnMultipleStatus: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public currentPage: number = 1;
	public limit: number = 10;
	public sort: string = 'Predeterminado';
	public totalPages: number = 0;
	public loading: boolean = true;
	private destroy$ = new Subject<void>();
	public categories: any = '';
	public categoriesSelected: any = [];

	public statusTable = [];
	public sortColumns = sortColumnsAttributes;
	public selectedIds = new Set<string>();
	public attributeGroups: AttributeGroupInterface[] = [];
	public errorMsmServerListGroupsAttributes: string = '';

	constructor(
		private _router: Router,
		private attributeService: AttributeService,
		private categoryService: CategoryService,
		private _route: ActivatedRoute
	) {}

	ngOnInit() {
		this._route.queryParams
			.pipe(
				takeUntil(this.destroy$),
				filter((params) => {
					const sortArrStr = sortColumnsAttributes.map((item) => item.value);
					const isValid = ValidateQPGroupsAttribute(this._route, params, this._router, sortArrStr);
					return isValid;
				})
			)
			.subscribe((params) => {
				const queryCategory = params['categories'] ?? 'Todos';
				this.filter = params['filter'] || '';
				this.currentPage = Number(params['page']) || 1;
				this.limit = Number(params['limit']) || 10;
				this.status = params['status'] ?? '';
				this.sort = params['sort'] ?? '';

				// ✅ Evita bucle de navegación
				if (this.categories !== queryCategory) {
					this.categories = queryCategory;
					this._router.navigate([], {
						relativeTo: this._route,
						queryParams: { ...params, categories: this.categories },
						queryParamsHandling: 'merge',
						replaceUrl: true,
					});
				} else {
					this.categories = queryCategory;
				}

				// ✅ Cargar datos independientes
				this.init_groups(this.filter, this.currentPage, this.status, this.limit, this.categories, this.sort);
			});
	}

	hasSelectedGroups(): boolean {
		return this.selectedIds.size > 0;
	}

	init_groups(filter: string, page: number, status: string, limit: number, categories: string, sort: string) {
		this.loading = true;
		this.errorMsmServerListGroupsAttributes = '';
		this.attributeService
			.get_groups_attributes(filter, page, limit, status, categories, sort)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { attributeGroups: AttributeGroupInterface[]; meta: any }) => {
					this.currentPage = next.meta.currentPage;
					this.totalPages = next.meta.totalPages;
					this.attributeGroups = next.attributeGroups;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerListGroupsAttributes = error;
				},
			});
	}

	onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	toggleItem(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			this.selectedIds.add(id);
		} else {
			this.selectedIds.delete(id);
		}
	}

	getSelectedIds(): string[] {
		return [...this.selectedIds];
	}

	setStatus(id: string, status: boolean) {
		this.loadBtnDelete.set(true);
		this.attributeService
			.update_status_group_attribute(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: { data: AttributeGroupInterface; message: true }) => {
					this.attributeGroups = this.attributeGroups.map((prev: any) => {
						if (next.data.id === prev.id) {
							return { ...prev, status: next.data.status };
						}
						return prev;
					});
					toastr.success(next.message);
					closeModal(id);
				},
				error: (error: any) => {
					toastr.error(error.error.message);
				},
			});
	}

	resetFilters() {
		this.filter = '';
		this.status = 'Todos';
		this.sort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;

		this._router.navigate([], {
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

	redirect() {
		this._router.navigate(['/products/attributes/groups'], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.status,
				sort: this.sort,
				categories: this.categories,
			},
		});
	}

	setLimit() {
		this.currentPage = 1;
		this.redirect();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.redirect(); // o init_collaborators()
	}

	getCategories(categories: any) {
		this.currentPage = 1;
		let selectedIds = categories.filter((c: any) => c.checked).map((c: any) => c.id);
		this.categories = selectedIds.join(',');
		if (selectedIds.length >= 1) {
			this.categories = selectedIds.join(',');
		} else {
			this.categories = 'Todos';
		}
		this.redirect();
	}

	onUpdateStatusMultiple(status: boolean) {
		this.loadBtnMultipleStatus.set(true);
		this.attributeService
			.update_status_group_attributes({
				ids: this.getSelectedIds(),
				status,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnMultipleStatus.set(false))
			)
			.subscribe({
				next: (next: { data: string[]; message: string }) => {
					this.attributeGroups = this.attributeGroups.map((prev: AttributeGroupInterface) => {
						if (next.data.includes(prev.id!)) {
							return { ...prev, status: status };
						}
						return prev;
					});
					toastr.success(next.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedIds.clear();
				},
				error: (error: any) => {
					toastr.error(error.error.message);
				},
			});
	}
}
