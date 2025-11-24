import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Collaborator } from '@app/common/interface/collaborator.interface';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { AuthService } from '@app/services/auth.service';
import { CollaboratorService } from '@app/services/collaborator.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { IMaskModule } from 'angular-imask';
import { rols } from '@app/common/constants/rols.constant';
import { NgSelectModule } from '@ng-select/ng-select';
import { identityDocuments } from '@app/common/constants/identityDocuments .constant';
import { AlertComponent } from '@app/shared/alert/alert.component';
declare const toastr: any;

@Component({
	selector: 'app-create-collaborator',
	imports: [SidebarComponent, TopbarComponent, CommonModule, FormsModule, RouterModule, IMaskModule, NgSelectModule, AlertComponent],
	templateUrl: './create-collaborator.component.html',
	styleUrl: './create-collaborator.component.css',
})
export class CreateCollaboratorComponent {
	public collaborator: Collaborator = {
		names: '',
		surname: '',
		type_document: undefined,
		number_document: '',
		role: undefined,
		email: '',
		password: '',
		phone: '',
	};
	public errorsCollaborator: any = {};
	public msmErrorCollaborator: any = [];
	private destroy$ = new Subject<void>();
	public loadBtn: boolean = false;
	public errorMsmServer: string = '';
	public rols = rols;
	public identityDocuments = identityDocuments;

	constructor(
		private authService: AuthService,
		private collaboratorService: CollaboratorService,
		private _router: Router
	) {}

	ngOnInit() {}

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

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	create() {
		this.loadBtn = true;
		this.collaboratorService
			.create_collaborator(this.collaborator)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.loadBtn = false))
			)
			.subscribe({
				next: (next) => {
					this.errorsCollaborator = {};
					toastr.success('Colaborador creado correctamente.');
					this._router.navigate(['/users/collaborators']);
				},
				error: (err) => {
					const error = err.error;
					this.errorMsmServer = error.message || '¡Error desconocido!';
					toastr.error(this.errorMsmServer);
					if (error.validation) {
						this.errorsCollaborator = error.validation;
						this.msmErrorCollaborator =Object.values(this.errorsCollaborator).flat();
						this.errorMsmServer = '';
						console.log(this.msmErrorCollaborator);
					}
				},
			});
	}
}
