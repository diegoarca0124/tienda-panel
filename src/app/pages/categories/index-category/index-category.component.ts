import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
import { statusTable } from '@app/common/constants/statusTable.contant';
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
import { finalize, Subject, takeUntil } from 'rxjs';
import { sortColumnsCategories } from '../constants/sort-columns-categories.constant';
import { CategoryInterface } from '../interfaces/category.interface';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ValidateQPCategories } from '../utils/validate-pq-categories.util';
import { FallbackImageDirective } from '@app/common/directives/fallback-image.directive';
import { environment } from 'environments/environment.dev';
import { PadCodePipe } from "../../../common/pipes/pad-code.pipe";
import { configurationsCategory } from '../constants/configurations-category.constant';
import { HttpErrorResponse } from '@angular/common/http';
declare const toastr: any;
declare const $: any;

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
    PadCodePipe
],
	templateUrl: './index-category.component.html',
	styleUrl: './index-category.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IndexCategoryComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public loadBtnMultipleStatus: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public configuration: any = 'Predeterminado';
	public currentPage: number = 1;
	public limit: number = 10;
	public sort: string = 'Predeterminado';
	public totalPages: number = 0;
	public loading: boolean = true;
	public categories: CategoryInterface[] = [];
	public screenHeight = window.innerHeight;
	public errorMsmServerListCategories: string = '';
	private destroy$ = new Subject<void>();
	public columns = [
		{ key: 'name', label: 'Categoría', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-200 col-w-md-250' },
	];
	public sortColumn: string = '';
	public sortDirection: 'asc' | 'desc' = 'asc';
	public pageLimit = pageLimit;
	public statusFilter = statusTable;
	public configurationFilter = configurationsCategory;
	public sortFilter = sortColumnsCategories;
	public selectedIds = new Set<string>();
	public readonly sortValues = sortColumnsCategories.map(item => item.value);
	public readonly configurationValues = configurationsCategory.map(item => item.value);
	constructor(
		private _router: Router,
		private categoryService: CategoryService,
		private _route: ActivatedRoute,
		private sanitizer: DomSanitizer
	) {}

	ngOnInit() {
		this._route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			if (!ValidateQPCategories(this._route, params, this._router, this.sortValues, this.configurationValues)) return;

			this.loadQueryParams(params);
			this.init_categories(this.filter, this.currentPage, this.status, this.limit, this.sort, this.configuration);
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private loadQueryParams(params: Params): void {
		this.filter = params['filter'] || '';
		this.currentPage = Number(params['page']);
		this.limit = Number(params['limit']);
		this.status = params['status'];
		this.sort = params['sort'];
		this.configuration = params['configuration'];
	}

	init_categories(filter: string, page: number, status: string, limit: number, sort: string, configuration: string) {
		this.loading = true;
		this.errorMsmServerListCategories = '';
		this.categories = [];
		this.categoryService
			.get_categories(filter, page, limit, status, sort, configuration)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { categories: CategoryInterface[]; meta: any }) => {
					console.log(next);

					this.categories = this.mapCategories(next.categories);
					this.currentPage = next.meta.currentPage;
					this.totalPages = next.meta.totalPages;
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.errorMsmServerListCategories = error;
				},
			});
	}

	private mapCategories(categories: CategoryInterface[]): CategoryInterface[] {
		return categories.map(category => ({
			...category,
			safeIcon: this.sanitizer.bypassSecurityTrustHtml(category.icon),
			productsPreview: category.productsPreview!.map(product => ({
				...product,
				cover: `${environment.s3_public_url}/products/small/${product.cover}`,
			})),
		}));
	}

	getColorBasedOnLetter(str: string) {
		return getColorBasedOnLetter(str);
	}

	hasSelectedCategories(): boolean {
		return this.selectedIds.size > 0;
	}

	setLimit() {
		this.currentPage = 1;
		this.redirect();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.redirect(); // o init_collaborators()
	}

	setStatus(id: string, status: boolean) {
		this.loadBtnDelete.set(true);
		this.categoryService
			.update_status_category(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: {data: CategoryInterface, message: string}) => {
					const category = this.categories.find(c => c.id === next.data.id);
					if (category) {
						category.status = next.data.status;
					}
					toastr.success(next.message);
					closeModal('modalDelete-'+id);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error.message);
				},
			});
	}

	redirect() {
		const queryParams = {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.status,
			sort: this.sort,
			configuration: this.configuration
		};

		const current: any = this._route.snapshot.queryParams;

		const same =
			(current.filter ?? '') === queryParams.filter &&
			Number(current.page) === queryParams.page &&
			Number(current.limit) === queryParams.limit &&
			(current.status ?? 'Todos') === queryParams.status &&
			(current.sort ?? 'Predeterminado') === queryParams.sort &&
			(current.configuration ?? 'Predeterminado') === queryParams.configuration;

		if (same) {
			this.init_categories(
				this.filter,
				this.currentPage,
				this.status,
				this.limit,
				this.sort,
				this.configuration
			);
			return;
		}

		this._router.navigate(['/products/categories'], {
			queryParams,
		});
	}

	resetFilters(){
		this.filter = '';
		this.status = 'Todos';
		this.sort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;
		this.configuration  = 'Predeterminado';

		this._router.navigate([], {
			queryParams: {
				filter: null,
				page: 1,
				limit: 10,
				status: null,
				sort: null,
				configuration: null
			},
			queryParamsHandling: 'merge',
		});
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

	onUpdateStatusMultiple(status: boolean){
		this.loadBtnMultipleStatus.set(true);
		this.categoryService
		.update_status_categories({
			ids: this.getSelectedIds(),
			status
		})
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => this.loadBtnMultipleStatus.set(false))
		)
		.subscribe({
			next: (next: {data: string[], message: string}) => {
				const updatedIds = new Set(next.data);
				this.categories = this.categories.map(prev => {
					if (updatedIds.has(prev.id!)) {
						return {
							...prev,
							status
						};
					}
					return prev;
				});
				toastr.success(next.message);
				closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
				this.selectedIds.clear();
			},
			error: (error: HttpErrorResponse) => {
				toastr.error(error.error.message);
			},
		});
	}
}
