import { CommonModule } from '@angular/common';
import { Component, HostListener, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { pageLimit } from '@app/common/constants/pageLimit.constant';
import { statusTable } from '@app/common/constants/statusTable.contant';
import { CollaboratorList } from '@app/common/interface/collaborator-list.interface';
import { Collaborator } from '@app/common/interface/collaborator.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { closeModal } from '@app/common/utils/close-modal.util';
import { copyToClipboard } from '@app/common/utils/copy-clipboard.util';
import { getColorBasedOnLetter } from '@app/common/utils/get-color-based-on-letter.util';
import { sendWhatsAppMessageWithObject } from '@app/common/utils/send-message-whatsapp.util';
import { sortColumnsTable } from '@app/common/utils/sort-columns-table.util';
import { ValidateQueryParams } from '@app/common/utils/validate-query-params.util';
import { CollaboratorService } from '@app/services/collaborator.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { Store } from '@ngrx/store';
import { finalize } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { sortColumnsCollaborators } from '../constants/sortColumnsCollaborators.constant';
declare const toastr: any;
declare const $: any;

@Component({
	selector: 'app-index-collaborator',
	imports: [TopbarComponent, SidebarComponent, CommonModule, FormsModule, RouterModule, ModalDeleteComponent, NotFoundComponent, PaginationComponent, NgSelectModule],
	templateUrl: './index-collaborator.component.html',
	styleUrl: './index-collaborator.component.css',
})
export class IndexCollaboratorComponent {
	public loadBtnDelete: WritableSignal<boolean> = signal(false);
	public loadBtnMultipleStatus: WritableSignal<boolean> = signal(false);
	public filter: string = '';
	public status: string = 'Todos';
	public sort: string = 'Predeterminado';
	public currentPage: number = 1;
	public limit: number = 10;
	public totalPages: number = 0;
	public loading: boolean = true;
	public arrDataSkull: Array<any> = Array.from({ length: 5 }, () => ({}));
	public collaborators: CollaboratorList[] = [];
	public screenHeight = window.innerHeight;
	public errorMsmServerListCollaborators: string = '';
	private destroy$ = new Subject<void>();
	public columns = [
		{ key: 'names', label: 'Colaborador', classCol: 'col-w-xs-200 col-w-md-250' },
		{ key: 'role', label: 'Rol', classCol: 'col-w-xs-100' },
		{ key: 'number_document', label: 'Documento', classCol: 'col-w-xs-100' },
		{ key: 'status', label: 'Estado', classCol: 'col-w-xs-100' },
	];
	public pageLimit = pageLimit;
	public statusTable = statusTable;
	public sortColumns = sortColumnsCollaborators;
	public selectedIds = new Set<string>();

	constructor(
		private _router: Router,
		private collaboratorService: CollaboratorService,
		private _route: ActivatedRoute
	) {}

	ngOnInit() {
		this._route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
			const sortArrStr = sortColumnsCollaborators.map(item => item.value);
			const isValid = ValidateQueryParams(this._route, params, this._router, sortArrStr);
			if (!isValid) return;

			this.filter = params['filter'] || '';
			this.currentPage = Number(params['page']);
			this.limit = Number(params['limit']);
			this.status = params['status'];
			this.sort = params['sort'];
			this.init_collaborators(this.filter, this.currentPage, this.status, this.limit, this.sort);
		});
	}

	@HostListener('window:resize', [])
	onResize() {
		this.screenHeight = window.innerHeight;
	}

	onFilterOrStatusChange() {
		this.currentPage = 1;
		this.redirect();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	init_collaborators(filter: string, page: number, status: string, limit: number, sort: string) {
		this.loading = true;
		this.errorMsmServerListCollaborators = '';
		this.collaboratorService
			.get_collaborators(filter, page, limit, status, sort)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { collaborators: CollaboratorList[]; currentPage: number; totalCollaborators: number; totalPages: number }) => {
					this.currentPage = next.currentPage;
					this.collaborators = next.collaborators;
					this.totalPages = next.totalPages;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerListCollaborators = error;
				},
			});
	}

	getColorBasedOnLetter(str: string) {
		return getColorBasedOnLetter(str);
	}

	redirect() {
		this._router.navigate([], {
			queryParams: {
				filter: this.filter,
				page: this.currentPage,
				limit: this.limit,
				status: this.status,
				sort: this.sort
			},
			queryParamsHandling: 'merge',
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

	setStatus(id: string, status: boolean) {
		this.loadBtnDelete.set(true);
		this.collaboratorService
			.update_status_collaborator(id, { status })
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => this.loadBtnDelete.set(false))
			)
			.subscribe({
				next: (next: Collaborator) => {
					this.collaborators = this.collaborators.map((prev: Collaborator) => {
						if (next.id === prev.id) {
							return { ...prev, status: next.status };
						}
						return prev;
					});

					toastr.success('Se actualizó el estado correctamente.');
					closeModal(id);
				},
				error: (error: any) => {
					toastr.error(error.error.message);
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
		this.collaboratorService
		.update_status_collaborators({
			ids: this.getSelectedIds(),
			status
		})
		.pipe(
			takeUntil(this.destroy$),
			withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
			finalize(() => this.loadBtnMultipleStatus.set(false))
		)
		.subscribe({
			next: (next: any) => {
				console.log(next);
				
				this.collaborators = this.collaborators.map((prev: Collaborator) => {
					if (next.includes(prev.id)) {
						return { ...prev, status: status };
					}
					return prev;
				});

				toastr.success('Se actualizó el estado correctamente.');
				closeModal(status ? 'modalMultipleActive' : 'modalMultipleDisabled');
				this.selectedIds.clear();
			},
			error: (error: any) => {
				toastr.error(error.error.message);
			},
		});
	}

}
