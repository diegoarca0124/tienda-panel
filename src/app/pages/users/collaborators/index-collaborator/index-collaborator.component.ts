import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { statusTable } from '@app/common/constants/statusTable.contant';
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
import { finalize } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { sortColumnsCollaborators } from '../constants/sortColumnsCollaborators.constant';
import { CollaboratorInterface } from '../interfaces/collaborator.interface';
import { ValidateQPCollaborators } from '../utils/validate-qp-collaborators.util';
import { HttpErrorResponse } from '@angular/common/http';
import { PaginationMetaInterface } from '@app/common/interface/pagination-meta.interface'
declare const toastr: any;

@Component({
	selector: 'app-index-collaborator',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, ModalDeleteComponent, NotFoundComponent, PaginationComponent, NgSelectModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	templateUrl: './index-collaborator.component.html',
	styleUrl: './index-collaborator.component.css',
})
export class IndexCollaboratorComponent {
	private destroy$ = new Subject<void>();

	public filter: string = '';
	public selectedStatus: string = 'Todos';
	public selectedSort: string = 'Predeterminado';

	public currentPage: number = 1;
	public totalPages: number = 0;
	public limit: number = 10;

	public statusTable = statusTable;
	public sortColumns = sortColumnsCollaborators;

	public selectedCollaboratorsIds = new Set<string>();

	public isCollaboratorsLoading: boolean = true;

	public collaboratorsLoadError: string = '';

	public isUpdatingSingleStatus: WritableSignal<boolean> = signal(false);
	public isUpdatingMultipleStatuses: WritableSignal<boolean> = signal(false);
	
	
	public collaborators: CollaboratorInterface[] = [];
	public screenHeight = window.innerHeight;
	
	
	public readonly sortValues = sortColumnsCollaborators.map(item => item.value);

	constructor(
		private _router: Router,
		private collaboratorService: CollaboratorService,
		private _route: ActivatedRoute
	) {}

	ngOnInit() {
		this._route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			if (!ValidateQPCollaborators(this._route, params, this._router, this.sortValues)) return;

			this.loadQueryParams(params);
			this.initCollaborators(this.filter, this.currentPage, this.selectedStatus, this.limit, this.selectedSort);
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

	initCollaborators(filter: string, page: number, status: string, limit: number, sort: string) {
		this.isCollaboratorsLoading = true;
		this.collaboratorsLoadError = '';
		this.collaborators = [];
		this.collaboratorService
			.getCollaborators(filter, page, limit, status, sort)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isCollaboratorsLoading = false))
			)
			.subscribe({
				next: (next: { collaborators: CollaboratorInterface[]; meta: PaginationMetaInterface}) => {
					this.selectedCollaboratorsIds.clear();
					this.collaborators = next.collaborators;
					this.totalPages = next.meta.totalPages;
					this.syncCurrentPage(next.meta.currentPage);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.collaboratorsLoadError = error;
				},
			});
	}

	syncCurrentPage(currentPage: number): void {
		if (this.currentPage === currentPage) return;

		this.currentPage = currentPage;

		this._router.navigate([], {
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

	getColorBasedOnLetter(str: string) {
		return getColorBasedOnLetter(str);
	}

	applyFilters() {
		const queryParams = {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.selectedStatus,
			sort: this.selectedSort,
		};

		const current :any= this._route.snapshot.queryParams;

		const same =
			(current.filter ?? '') === queryParams.filter &&
			Number(current.page ?? 1) === queryParams.page &&
			Number(current.limit ?? 10) === queryParams.limit &&
			(current.status ?? 'Todos') === queryParams.status &&
			(current.sort ?? 'Predeterminado') === queryParams.sort;

		if (same) {
			this.initCollaborators(
				this.filter,
				this.currentPage,
				this.selectedStatus,
				this.limit,
				this.selectedSort
			);
			return;
		}

		this._router.navigate([], {
			queryParams,
		});
	}

	onSendWtpp(data: { names: string; surname: string; email: string }) {
		sendWhatsAppMessageWithObject(data);
	}

	onCopyClick(data: { names: string; surname: string; email: string }): void {
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
			.update_status_collaborator(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.isUpdatingSingleStatus.set(false))
			)
			.subscribe({
				next: (next: {data: CollaboratorInterface, message: string}) => {
					const collaborator = this.collaborators.find(c => c.id === next.data.id);
					if (collaborator) {
						collaborator.status = next.data.status;
					}
					toastr.success(next.message);
					closeModal('modalDelete-'+id);
				},
				error: (error: HttpErrorResponse) => {
					toastr.error(error.error.message);
				},
			});
	}

	onLimitChange() {
		this.currentPage = 1;
		this.applyFilters();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.applyFilters();
	}

	onResetCurrentPage(){
		this.currentPage = 1;
	}

	resetFilters(){
		this.filter = '';
		this.selectedStatus = 'Todos';
		this.selectedSort = 'Predeterminado';
		this.currentPage = 1;
		this.limit = 10;

		this._router.navigate([], {
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

	onCollaboratorSelectionChange(id: string, event: Event) {
		const checked = (event.target as HTMLInputElement).checked;
		if (checked) {
			this.selectedCollaboratorsIds.add(id);
		} else {
			this.selectedCollaboratorsIds.delete(id);
		}
	}

	getSelectedIds(): string[] {
		return [...this.selectedCollaboratorsIds];
	}

	get hasSelectedCollaborators(): boolean {
		return this.selectedCollaboratorsIds.size > 0;
	}

	onUpdateStatusMultiple(status: boolean){
		this.isUpdatingMultipleStatuses.set(true);
		this.collaboratorService
		.update_status_collaborators({
			ids: this.getSelectedIds(),
			status
		})
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => this.isUpdatingMultipleStatuses.set(false))
		)
		.subscribe({
			next: (next: {data: string[], message: string}) => {
				const updatedIds = new Set(next.data);
				this.collaborators = this.collaborators.map(prev => {
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
				this.selectedCollaboratorsIds.clear();
			},
			error: (error: HttpErrorResponse) => {
				toastr.error(error.error.message);
			},
		});
	}

	
}
