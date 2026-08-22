import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { AuthService } from '@app/services/auth.service';
import { CollaboratorService } from '@app/services/collaborator.service';
import { GLOBAL } from '@app/services/GLOBAL';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { finalize, takeUntil } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';
import { IMaskModule } from 'angular-imask';
import { NgSelectModule } from '@ng-select/ng-select';
import { CollaboratorInterface } from '../interfaces/collaborator.interface';
import { createEmptyCollaborator, createEmptyFieldErrors } from '../utils/empties.util';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { CollaboratorFieldErrors, CollaboratorValidationErrors } from '../interfaces/validation.interface';
import { documentsOptions, rolesOptions } from '../constants/selectors.constants';
import { CreateCollaboratorRESI } from '../interfaces/responses.interface';
import { HttpErrorResponse } from '@angular/common/http';
declare const toastr: any;

@Component({
	selector: 'app-create-collaborator',
	imports: [SidebarComponent, TopbarComponent, CommonModule, FormsModule, RouterModule, IMaskModule, NgSelectModule, ValidationPopoverComponent],
	templateUrl: './create-collaborator.component.html',
	styleUrl: './create-collaborator.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CreateCollaboratorComponent {
	public collaborator: CollaboratorInterface = createEmptyCollaborator();
	public validationCollaboratorError: CollaboratorValidationErrors = {};
	private destroy$ = new Subject<void>();
	public isCreateCollaboratorLoading: boolean = false;
	public rolesOptions = rolesOptions;
	public documentsOptions = documentsOptions;
	public fieldErrors: CollaboratorFieldErrors = createEmptyFieldErrors();

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

	createCollaborator() {
		this.isCreateCollaboratorLoading = true;
		this.collaboratorService
			.createCollaborator(this.collaborator)
			.pipe(
				takeUntil(this.destroy$),
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				finalize(() => (this.isCreateCollaboratorLoading = false))
			)
			.subscribe({
				next: (next: CreateCollaboratorRESI) => {
					this.validationCollaboratorError = {};
					toastr.success(next.message);
					this._router.navigate(['/users/collaborators']);
				},
				error: (err: HttpErrorResponse) => {
					const error = err?.error ?? {};
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationCollaboratorError = error.validation;
						this.fieldErrors = buildShowErrors(this.fieldErrors, this.validationCollaboratorError);
					}
				},
			});
	}
}
