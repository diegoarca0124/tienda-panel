import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
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
	public loadBtnStatusSingle: WritableSignal<boolean> = signal(false);
	public loadBtnStatusMultiple: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public sort: string = 'Predeterminado';
	public currentPage: number = 1;
	public limit: number = 10;
	public totalPages: number = 0;
	public loading: boolean = true;
	public collaborators: CollaboratorInterface[] = [];
	public screenHeight = window.innerHeight;
	public errorMsmServerListCollaborators: string = '';
	private destroy$ = new Subject<void>();
	public pageLimit = pageLimit;
	public statusTable = statusTable;
	public sortColumns = sortColumnsCollaborators;
	public selectedIds = new Set<string>();
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
			this.initCollaborators(this.filter, this.currentPage, this.status, this.limit, this.sort);
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
		this.status = params['status'];
		this.sort = params['sort'];
	}

	initCollaborators(filter: string, page: number, status: string, limit: number, sort: string) {
		this.loading = true;
		this.errorMsmServerListCollaborators = '';
		this.collaborators = [];
		this.collaboratorService
			.get_collaborators(filter, page, limit, status, sort)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { collaborators: CollaboratorInterface[]; meta: PaginationMetaInterface}) => {
					this.selectedIds.clear();
					this.collaborators = next.collaborators;
					this.totalPages = next.meta.totalPages;
					this.syncCurrentPage(next.meta.currentPage);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.errorMsmServerListCollaborators = error;
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
				status: this.status,
				sort: this.sort,
			},
			replaceUrl: true,
		});
	}

	getColorBasedOnLetter(str: string) {
		return getColorBasedOnLetter(str);
	}

	redirect() {
		const queryParams = {
			filter: this.filter,
			page: this.currentPage,
			limit: this.limit,
			status: this.status,
			sort: this.sort,
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
				this.status,
				this.limit,
				this.sort
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
		this.loadBtnStatusSingle.set(true);
		this.collaboratorService
			.update_status_collaborator(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnStatusSingle.set(false))
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
		this.redirect();
	}

	onPageChange(newPage: number) {
		this.currentPage = newPage;
		this.redirect();
	}

	onResetCurrentPage(){
		this.currentPage = 1;
	}

	resetFilters(){
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
			},
			queryParamsHandling: 'merge',
		});
	}

	toggleItem(id: string, checked: boolean) {
		if (checked) {
			this.selectedIds.add(id);
		} else {
			this.selectedIds.delete(id);
		}
	}

	getSelectedIds(): string[] {
		return [...this.selectedIds];
	}

	get hasSelectedCollaborators(): boolean {
		return this.selectedIds.size > 0;
	}

	onUpdateStatusMultiple(status: boolean){
		this.loadBtnStatusMultiple.set(true);
		this.collaboratorService
		.update_status_collaborators({
			ids: this.getSelectedIds(),
			status
		})
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => this.loadBtnStatusMultiple.set(false))
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
				this.selectedIds.clear();
			},
			error: (error: HttpErrorResponse) => {
				toastr.error(error.error.message);
			},
		});
	}

	
}
