import { getHttpErrorBody } from '@app/common/utils/get-http-error-body.util';
import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { withMinLoadingTime } from '@app/common/interface/with-min-loading-time.interface';
import { setUserAuth } from '@app/store/auth/auth.action';
import { AuthService } from '@app/services/auth.service';
import { AuthUserState } from '@app/store/auth/auth.state';
import { GLOBAL } from '@app/services/GLOBAL';
import { CollaboratorInterface } from '@app/pages/users/collaborators/interfaces/collaborator.interface';
declare const toastr: any;

interface Auth {
	email: string;
	password: string;
}

@Component({
	selector: 'app-login',
	imports: [CommonModule, FormsModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css',
})
export class LoginComponent {
	public errorsLogin: any = {};
	public auth: Auth = {
		email: '',
		password: '',
	};
	public errorMsmServer = '';
	public loading = false;
	public showPassword = false;
	private destroy$ = new Subject<void>();

	constructor(
		private router: Router,
		private authService: AuthService,
		private store: Store<{ authUser: AuthUserState }>
	) {}

	ngOnInit() {
		if (!this.authService.getToken()) return;

		this.loading = true;
		this.authService
			.validate_token()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (response) => {
					if (response.valid === true) {
						this.router.navigate(['/dashboard']);
					} else {
						this.authService.clearSession();
					}
				},
				error: (error: unknown) => {
					if (error instanceof HttpErrorResponse && error.status === 401) {
						this.authService.clearSession();
					} else {
						toastr.error(getHttpErrorBody(error, 'No fue posible validar tu sesión. Intenta nuevamente.').message);
					}
				},
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	login() {
		this.errorsLogin = {};
		this.errorMsmServer = '';
		this.loading = true;
		this.authService
			.login(this.auth)
			.pipe(
				withMinLoadingTime(GLOBAL.MIN_LOADING_TIME),
				takeUntil(this.destroy$),
				finalize(() => (this.loading = false))
			)
			.subscribe({
				next: (next: { data: { accessToken: string; collaborator: CollaboratorInterface }; message: string }) => {
					localStorage.setItem('token', next.data.accessToken);
					this.store.dispatch(setUserAuth({ user: next.data.collaborator }));
					toastr.success(next.message);
					this.router.navigate(['/dashboard']);
				},
				error: (err) => {
					const error = getHttpErrorBody(err);
					toastr.error(error.message || '¡Error desconocido!');
					if (error.validation) {
						this.errorsLogin = error.validation;
						this.errorMsmServer = '';
					}
				},
			});
	}
}
