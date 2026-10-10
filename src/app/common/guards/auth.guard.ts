import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { getHttpErrorBody } from '@app/common/utils/get-http-error-body.util';

declare const toastr: any;

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	canActivate(): Observable<boolean | UrlTree> {
		if (!this.authService.getToken()) {
			this.authService.clearSession();
			return of(this.router.createUrlTree(['/']));
		}

		return this.authService.validate_token().pipe(
			map((response): boolean | UrlTree => {
				if (response.valid === true) return true;

				this.authService.clearSession();
				return this.router.createUrlTree(['/']);
			}),
			catchError((error: unknown) => {
				if (error instanceof HttpErrorResponse && error.status === 401) {
					this.authService.clearSession();
				} else {
					toastr.error(getHttpErrorBody(error, 'No fue posible validar tu sesión. Intenta nuevamente.').message);
				}
				return of(this.router.createUrlTree(['/']));
			})
		);
	}
}
