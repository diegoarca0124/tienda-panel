import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	canActivate(): Observable<boolean | UrlTree> {
		return this.authService.validate_token().pipe(
			map((response: any) => {
				console.log(response);
				if (response.valid || response.success) {
					return true;
				} else {
					this.authService.logout();
					return this.router.createUrlTree(['/']);
				}
			}),
			catchError((error) => {
				this.authService.logout();
				return of(this.router.createUrlTree(['/']));
			})
		);
	}
}
