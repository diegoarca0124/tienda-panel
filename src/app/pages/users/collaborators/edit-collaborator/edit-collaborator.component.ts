import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { createEmptyCollaborator, createEmptyFieldErrors } from '../utils/empties.util';
import { CollaboratorInterface } from '../interfaces/collaborator.interface';
import { ValidationPopoverComponent } from '@app/shared/validation-popover/validation-popover.component';
import { buildShowErrors } from '@app/common/utils/build-show.errors.util';
import { CollaboratorFieldErrors, CollaboratorValidationErrors } from '../interfaces/validation.interface';
import { GetCollaboratorRESI, UpdateCollaboratorRESI } from '../interfaces/responses.interface';
import { HttpErrorResponse } from '@angular/common/http';
import { documentsOptions, rolesOptions } from '../constants/selectors.constants';
declare const toastr: any;

@Component({
	selector: 'app-edit-collaborator',
	imports: [SidebarComponent, TopbarComponent, CommonModule, RouterModule, FormsModule, IMaskModule, NotFoundComponent, NgSelectModule, AlertComponent, ValidationPopoverComponent],
	templateUrl: './edit-collaborator.component.html',
	styleUrl: './edit-collaborator.component.css',
	schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class EditCollaboratorComponent {
	private destroy$ = new Subject<void>();
	public collaborator: CollaboratorInterface = createEmptyCollaborator();
	public isEditCollaboratorLoading: boolean = false;
	public isCollaboratorLoading: boolean = true;
	public id: string = '';
	public validationCollaboratioError: CollaboratorValidationErrors = {};
	public collaboratorLoadError: string = '';
	public rolesOptions = rolesOptions;
	public documentsOptions = documentsOptions;
	public fieldErrors : CollaboratorFieldErrors  = createEmptyFieldErrors();

	constructor(
		private collaboratorService: CollaboratorService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	ngOnInit() {
		this.route.params.pipe(takeUntil(this.destroy$)).subscribe({
			next: (next) => {
				this.id = next['id'];
				this.initData();
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

	initData() {
		this.isCollaboratorLoading = true;
		this.collaboratorLoadError = '';
		this.collaboratorService
			.getCollaborator(this.id)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.isCollaboratorLoading = false))
			)
			.subscribe({
				next: (next: GetCollaboratorRESI) => {
					this.collaborator = next.data;
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					this.collaboratorLoadError = error;
				},
			});
	}

	updateCollaborator() {
		this.isEditCollaboratorLoading = true;
		this.collaboratorService
			.updateCollaborator(this.id, this.collaborator)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.isEditCollaboratorLoading = false))
			)
			.subscribe({
				next: (next: UpdateCollaboratorRESI) => {
					this.validationCollaboratioError = {};
					this.collaborator = next.data;
					toastr.success(next.message);
				},
				error: (err: HttpErrorResponse) => {
					const error = err.error;
					toastr.error(error.message || '¡Error desconocido!');

					if (error.validation) {
						this.validationCollaboratioError = error.validation;
						this.fieldErrors = buildShowErrors(this.fieldErrors,this.validationCollaboratioError);
					}
				},
			});
	}
}
