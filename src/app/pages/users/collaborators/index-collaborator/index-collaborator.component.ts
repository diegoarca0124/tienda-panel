import { getHttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { copyToClipboard } from '@app/common/utils/copy-clipboard.util';
import { getColorBasedOnLetter } from '@app/common/utils/get-color-based-on-letter.util';
import { sendWhatsAppMessageWithObject } from '@app/common/utils/send-message-whatsapp.util';
import { CollaboratorService } from '@app/services/collaborator.service';
import { AuthService } from '@app/services/auth.service';
import { Store } from '@ngrx/store';
import { AuthUserState } from '@app/store/auth/auth.state';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { catchError, finalize, map, of, switchMap, take } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { CollaboratorInterface } from '../interfaces/collaborator.interface';
import { validateCollaboratorsQueryParams } from '../utils/validate-collaborators-query-params.util';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationMetaInterface } from '@app/common/interface/pagination-meta.interface';
import { GetCollaboratorsQPI } from '../interfaces/query-params.interface';
import { GetCollaboratorsRESI, RevokeCollaboratorSessionsRESI, UpdateCollaboratorsStatusRESI, UpdateCollaboratorStatusRESI } from '../interfaces/responses.interface';
import { sortOptions, statusOptions } from '../constants/selectors.constants';
import { COLLABORATOR_STATUS_DETAILS } from '../constants/collaborator-status.constants';
import { PAGINATION_LIMITS } from '@app/common/constants/pageLimit.constant';
import { SesionsModalIndexCollaboratorComponent } from './components/sesions-modal-index-collaborator/sesions-modal-index-collaborator.component';
declare const toastr: any;

type CollaboratorsLoadResult = { data: GetCollaboratorsRESI; error: null } | { data: null; error: HttpErrorResponse };

@Component({
	selector: 'app-index-collaborator',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, ModalDeleteComponent, NotFoundComponent, PaginationComponent, NgSelectModule, SesionsModalIndexCollaboratorComponent],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: './index-collaborator.component.html',
	styleUrl: './index-collaborator.component.css',
})
export class IndexCollaboratorComponent {
	public readonly paginationLimits = PAGINATION_LIMITS;
	private destroy$ = new Subject<void>();
	private readonly collaboratorsQuery$ = new Subject<GetCollaboratorsQPI>();

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedSort: string = 'Predeterminado';

	public currentPage: number = 1;
	public totalPages: number = 0;
	public totalCollaborators: number = 0;
	public limit: number = 10;

	public readonly statusFilters = statusOptions;
	public readonly sortFilters = sortOptions;
	public readonly collaboratorStatusDetails = COLLABORATOR_STATUS_DETAILS;

	public selectedCollaboratorsIds = new Set<string>();
	public readonly maxSelectedCollaborators = 20;
	public isCollaboratorsLoading: boolean = true;
	public collaboratorsLoadError: Record<string, any> | null = null;

	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingMultipleStatuses: WritableSignal<boolean> = signal(false);
	public readonly isRevokingSessions = signal(false);
	public collaboratorToRevokeSessions: Pick<CollaboratorInterface, 'id' | 'names' | 'surname' | 'status'> | null = null;
	public revokeSessionsError: string | null = null;

	public collaborators: CollaboratorInterface[] = [];
	public screenHeight: number = window.innerHeight;

	constructor(
		private router: Router,
		private collaboratorService: CollaboratorService,
		private route: ActivatedRoute,
		private authService: AuthService,
		private store: Store<{ authUser: AuthUserState }>
	) {}

	ngOnInit(): void {
		this.listenCollaboratorsQueries();
		this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const { isValid, queryParams } = validateCollaboratorsQueryParams(params);
			if (!isValid) {
				this.router.navigate([], {
					relativeTo: this.route,
					queryParams,
					replaceUrl: true,
				});
				return;
			}
			this.loadQueryParams(queryParams);
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

	private loadQueryParams(params: GetCollaboratorsQPI): void {
		this.filter = params.filter;
		this.currentPage = params.page;
		this.limit = params.limit;
		this.selectedStatus = params.status;
		this.selectedSort = params.sort;
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
					this.collaboratorsLoadError = null;
					this.clearCollaboratorsTable();
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
					this.collaboratorsLoadError = getHttpErrorBody(error);
					this.clearCollaboratorsTable();
					return;
				}
				if (!data) return;
				this.selectedCollaboratorsIds.clear();
				this.collaborators = data.collaborators;
				this.totalPages = data.meta.totalPages;
				this.totalCollaborators = data.meta.totalCollaborators;
				this.syncCurrentPage(data.meta.currentPage);
			});
	}

	private refreshCollaborators(): void {
		this.loadCollaborators();
	}

	private clearCollaboratorsTable(): void {
		this.collaborators = [];
		this.totalCollaborators = 0;
		this.totalPages = 0;
		this.selectedCollaboratorsIds.clear();
	}

	get canUpdateSelectedCollaborators(): boolean {
		return !this.isCollaboratorsLoading && !this.collaboratorsLoadError && !this.isUpdatingMultipleStatuses() && !this.isUpdatingSingleStatus()
			&& this.selectedCollaboratorsIds.size > 0
			&& this.selectedCollaboratorsIds.size <= this.maxSelectedCollaborators
			&& [...this.selectedCollaboratorsIds].every((id) => this.collaborators.some((collaborator) => collaborator.id === id));
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

		const normalizedFilter = typeof this.filter === 'string' ? this.filter.trim().slice(0, 50) : '';

		this.filter = normalizedFilter;

		const queryParams = {
			filter: normalizedFilter,
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
					toastr.success(next.message);
					closeModal(`modalDelete-${id}`);
					this.refreshCollaborators();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message);
				},
			});
	}

	prepareSessionRevocation(collaborator: CollaboratorInterface): void {
		if (!collaborator.id || this.isRevokingSessions()) return;
		this.collaboratorToRevokeSessions = {
			id: collaborator.id,
			names: collaborator.names,
			surname: collaborator.surname,
			status: collaborator.status,
		};
		this.revokeSessionsError = null;
	}

	onRevokeSessions(): void {
		const id = this.collaboratorToRevokeSessions?.id;
		if (!id || this.isRevokingSessions()) return;

		this.isRevokingSessions.set(true);
		this.revokeSessionsError = null;
		this.collaboratorService
			.revokeCollaboratorSessions(id)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => this.isRevokingSessions.set(false))
			)
			.subscribe({
				next: (response: RevokeCollaboratorSessionsRESI) => {
					toastr.success(response.message);
					closeModal('modalRevokeCollaboratorSessions');
					this.collaboratorToRevokeSessions = null;
					this.store.select('authUser').pipe(take(1), takeUntil(this.destroy$)).subscribe(({ user }) => {
						if (user?.id === id) {
							this.authService.clearSession();
							this.router.navigate(['/']);
						}
					});
				},
				error: (error: HttpErrorResponse) => {
					this.revokeSessionsError = getHttpErrorBody(error, 'No fue posible cerrar las sesiones. Intenta nuevamente.').message;
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

	get hasSelectedCollaborators(): boolean {
		return this.selectedCollaboratorsIds.size > 0;
	}

	get firstVisibleCollaborator(): number {
		if (this.totalCollaborators === 0 || this.collaborators.length === 0) return 0;
		return (this.currentPage - 1) * this.limit + 1;
	}

	get lastVisibleCollaborator(): number {
		if (this.totalCollaborators === 0 || this.collaborators.length === 0) return 0;
		return Math.min(this.firstVisibleCollaborator + this.collaborators.length - 1, this.totalCollaborators);
	}

	clearCollaboratorSelection(): void {
		this.selectedCollaboratorsIds.clear();
	}

	selectAllCollaborators(): void {
		if (this.isCollaboratorsLoading || this.collaboratorsLoadError) return;
		const ids = [...new Set(this.collaborators.map((collaborator) => collaborator.id).filter((id): id is string => Boolean(id)))];
		for (const id of ids) {
			if (this.selectedCollaboratorsIds.size >= this.maxSelectedCollaborators) break;
			this.selectedCollaboratorsIds.add(id);
		}
		if (ids.some((id) => !this.selectedCollaboratorsIds.has(id))) {
			toastr.info(`Puedes seleccionar un máximo de ${this.maxSelectedCollaborators} registros.`);
		}
	}

	get areAllCollaboratorsSelected(): boolean {
		return this.collaborators.length > 0 && this.collaborators.every((collaborator) => Boolean(collaborator.id) && this.selectedCollaboratorsIds.has(collaborator.id!));
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
		if (!id || this.isCollaboratorsLoading || this.collaboratorsLoadError) return;
		if (checked) {
			if (!this.selectedCollaboratorsIds.has(id) && this.selectedCollaboratorsIds.size >= this.maxSelectedCollaborators) return;
			this.selectedCollaboratorsIds.add(id);
		} else {
			this.selectedCollaboratorsIds.delete(id);
		}
	}

	onUpdateStatusMultiple(status: boolean) {
		if (!this.canUpdateSelectedCollaborators) return;
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
					toastr.success(next.message);
					closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
					this.selectedCollaboratorsIds.clear();
					this.refreshCollaborators();
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(getHttpErrorBody(error, 'No fue posible actualizar el estado.').message);
				},
			});
	}
}
