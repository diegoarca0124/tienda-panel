import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { copyToClipboard } from '@app/common/utils/copy-clipboard.util';
import { getColorBasedOnLetter } from '@app/common/utils/get-color-based-on-letter.util';
import { sendWhatsAppMessageWithObject } from '@app/common/utils/send-message-whatsapp.util';
import { CollaboratorService } from '@app/services/collaborator.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, finalize, map, of, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { CollaboratorInterface } from '../interfaces/collaborator.interface';
import { validateCollaboratorsQueryParams } from '../utils/validate-collaborators-query-params.util';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationMetaInterface } from '@app/common/interface/pagination-meta.interface';
import { GetCollaboratorsQPI } from '../interfaces/query-params.interface';
import { GetCollaboratorsRESI, UpdateCollaboratorsStatusRESI, UpdateCollaboratorStatusRESI } from '../interfaces/responses.interface';
import { sortOptions, statusOptions } from '../constants/selectors.constants';
declare const toastr: any;

type CollaboratorsLoadResult = { data: GetCollaboratorsRESI; error: null } | { data: null; error: HttpErrorResponse };

@Component({
	selector: 'app-index-collaborator',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, ModalDeleteComponent, NotFoundComponent, PaginationComponent, NgSelectModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: './index-collaborator.component.html',
	styleUrl: './index-collaborator.component.css',
})
export class IndexCollaboratorComponent {
	private destroy$ = new Subject<void>();
	private readonly collaboratorsQuery$ = new Subject<GetCollaboratorsQPI>();

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedSort: string = 'Predeterminado';

	public currentPage: number = 1;
	public totalPages: number = 0;
	public limit: number = 10;

	public readonly statusFilters = statusOptions;
	public readonly sortFilters = sortOptions;

	public selectedCollaboratorsIds = new Set<string>();
	public isCollaboratorsLoading: boolean = true;
	public collaboratorsLoadError: string = '';

	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingMultipleStatuses: WritableSignal<boolean> = signal(false);

	public collaborators: CollaboratorInterface[] = [];
	public screenHeight: number = window.innerHeight;
	public readonly sortValues = sortOptions.map((item) => item.value);

	constructor(
		private router: Router,
		private collaboratorService: CollaboratorService,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.listenCollaboratorsQueries();
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const validParams = validateCollaboratorsQueryParams(this.route, params, this.router, this.sortValues);
			if (!validParams) return;
			this.loadQueryParams(params);
			this.loadCollaborators();
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
		this.currentPage = Number(params['page'] ?? 1);
		this.limit = Number(params['limit'] ?? 10);
		this.selectedStatus = params['status'];
		this.selectedSort = params['sort'];
	}

	private loadCollaborators(): void {
		this.collaboratorsQuery$.next({
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
		});
	}

	private listenCollaboratorsQueries(): void {
		this.collaboratorsQuery$
			.pipe(
				switchMap((query) => {
					this.isCollaboratorsLoading = true;
					this.collaboratorsLoadError = '';
					return this.collaboratorService.getCollaborators(query).pipe(
						withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
						map(
							(data): CollaboratorsLoadResult => ({
								data,
								error: null,
							})
						),
						catchError((error: HttpErrorResponse) =>
							of<CollaboratorsLoadResult>({
								data: null,
								error,
							})
						)
					);
				}),
				takeUntil(this.destroy$)
			)
			.subscribe(({ data, error }) => {
				this.isCollaboratorsLoading = false;
				if (error) {
					this.collaboratorsLoadError = error.error;
					return;
				}
				if (!data) return;
				this.selectedCollaboratorsIds.clear();
				this.collaborators = data.collaborators;
				this.totalPages = data.meta.totalPages;
				this.syncCurrentPage(data.meta.currentPage);
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
			},
			replaceUrl: true,
		});
	}

	getAvatarColor(str: string) {
		return getColorBasedOnLetter(str);
	}

	applyFilters(resetPage: boolean = true): void {
		if (resetPage) {
			this.currentPage = 1;
		}

		const queryParams = {
			filter: this.filter.trim(),
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
		};

		const current = this.route.snapshot.queryParams;

		const same =
			(current['filter'] ?? '') === queryParams.filter &&
			Number(current['page'] ?? 1) === queryParams.page &&
			Number(current['limit'] ?? 10) === queryParams.limit &&
			(current['status'] ?? 'Todos') === queryParams.status &&
			(current['sort'] ?? 'Predeterminado') === queryParams.sort;

		if (same) {
			this.loadCollaborators();
			return;
		}

		this.router.navigate([], {
			relativeTo: this.route,
			queryParams,
		});
	}

	sendCollaboratorByWhatsApp(data: { names: string; surname: string; email: string }) {
		sendWhatsAppMessageWithObject(data);
	}

	copyCollaboratorToClipboard(data: { names: string; surname: string; email: string }): void {
		copyToClipboard(data).then((success) => {
			if (success) {
				toastr.success('Texto copiado al portapapeles.');
			} else {
				toastr.error('Error al copiar al portapapeles.');
			}
		});
	}

	onUpdateStatus(id: string, status: boolean) {
		this.isUpdatingSingleStatus.set(true);
		this.collaboratorService
			.updateCollaboratorStatus(id, { status: !status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingSingleStatus.set(false))
			)
			.subscribe({
				next: (next: UpdateCollaboratorStatusRESI) => {
					const collaborator = this.collaborators.find((c) => c.id === next.data.id);
					if (collaborator) {
						collaborator.status = next.data.status;
					}
					toastr.success(next.message);
					closeModal('modalDelete-' + id);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error.message);
				},
			});
	}

	onLimitChange(): void {
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

	resetFilters() {
		this.filter = '';
		this.selectedStatus = 'Todos';
		this.selectedSort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;

		this.router.navigate([], {
			queryParams: {
				filter: null,
				page: 1,
				limit: 10,
				status: null,
				sort: null,
			},
			queryParamsHandling: 'merge',
		});
	}

	onCollaboratorSelectionChange(id: string, checked: boolean): void {
		if (checked) {
			this.selectedCollaboratorsIds.add(id);
		} else {
			this.selectedCollaboratorsIds.delete(id);
		}
	}

	get hasSelectedCollaborators(): boolean {
		return this.selectedCollaboratorsIds.size > 0;
	}

	onUpdateStatusMultiple(status: boolean) {
		this.isUpdatingMultipleStatuses.set(true);
		this.collaboratorService
			.updateCollaboratorsStatus({
				ids: [...this.selectedCollaboratorsIds],
				status,
			})
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingMultipleStatuses.set(false))
			)
			.subscribe({
				next: (next: UpdateCollaboratorsStatusRESI) => {
					console.log(next);

					const updatedIds = new Set(next.data);
					this.collaborators = this.collaborators.map((prev) => {
						if (updatedIds.has(prev.id!)) {
							return {
								...prev,
								status: status,
							};
						}
						return prev;
					});
					toastr.success(next.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedCollaboratorsIds.clear();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error.message);
				},
			});
	}
}
