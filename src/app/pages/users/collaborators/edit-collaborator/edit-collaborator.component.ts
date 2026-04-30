import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { identityDocuments } from '@app/common/constants/identityDocuments .constant';
import { rols } from '@app/common/constants/rols.constant';
import { Collaborator } from '@app/common/interface/collaborator.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { CollaboratorService } from '@app/services/collaborator.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { AlertComponent } from '@app/shared/alert/alert.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { IMaskModule } from 'angular-imask';
import { finalize, Subject, takeUntil } from 'rxjs';
declare const toastr: any;

@Component({
	selector: 'app-edit-collaborator',
	imports: [SidebarComponent, TopbarComponent, CommonModule, RouterModule, FormsModule, IMaskModule, NotFoundComponent, NgSelectModule, AlertComponent],
	templateUrl: './edit-collaborator.component.html',
	styleUrl: './edit-collaborator.component.css',
})
export class EditCollaboratorComponent {
	private destroy$ = new Subject<void>();
	public collaborator: Collaborator = {
		names: '',
		surname: '',
		type_document: '',
		role: '',
		number_document: '',
		email: '',
		password: '',
		phone: '',
	};
	public loadBtn: boolean = false;
	public loading: boolean = true;
	public id: string = '';
	public errorsCollaborator: any = {};
	public msmErrorCollaborator: any = [];
	public errorMsmServerGetCollaborator: string = '';
	public errorMsmServer: string = '';
	public rols = rols;
	public identityDocuments = identityDocuments;

	constructor(
		private collaboratorService: CollaboratorService,
		private _route: ActivatedRoute,
		private _router: Router
	) {}

	ngOnInit() {
		this._route.params.pipe(takeUntil(this.destroy$)).subscribe({
			next: (next) => {
				this.id = next['id'];
				this.init_data();
			},
			error: (error) => {},
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	generatePassword(length: number = 6) {
		const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?';
		let password = '';
		if (length < 8) length = 8;

		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset[randomIndex];
		}
		this.collaborator.password = password;
	}

	init_data() {
		this.loading = true;
		this.errorMsmServerGetCollaborator = '';
		this.collaboratorService
			.get_collaborator(this.id)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: Collaborator) => {
					this.collaborator = next;
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServerGetCollaborator = error;
				},
			});
	}

	update() {
		this.loadBtn = true;
		this.errorMsmServer = '';
		this.errorsCollaborator = {};
		this.msmErrorCollaborator = [];
		
		this.collaboratorService
			.update_collaborator(this.id, this.collaborator)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next: Collaborator) => {
					this.collaborator = next;
					toastr.success('Colaborador actualizado correctamente.');
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);

					if (error.validation) {
						this.errorsCollaborator = error.validation;
						this.msmErrorCollaborator =Object.values(this.errorsCollaborator).flat();
					}
					
				},
			});
	}
}
