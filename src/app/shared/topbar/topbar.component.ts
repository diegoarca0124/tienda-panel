import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AuthService } from '@app/services/auth.service';
import { getColorBasedOnLetter } from '@app/common/utils/get-color-based-on-letter.util';
import { AuthUserState } from '@app/store/auth/auth.state';
import { clearUserAuth } from '@app/store/auth/auth.action';
declare var KTMenu: any;

@Component({
	selector: 'app-topbar',
	imports: [RouterModule, CommonModule],
	templateUrl: './topbar.component.html',
	styleUrl: './topbar.component.css',
})
export class TopbarComponent {
	private destroy$ = new Subject<void>();
	public user: any = {};

	constructor(
		private router: Router,
		private store: Store<{ authUser: AuthUserState }>,
		private authService: AuthService
	) {
		this.store
			.select('authUser')
			.pipe(takeUntil(this.destroy$))
			.subscribe((state) => {
				this.user = state.user;
				console.log(this.user);
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	getColorBasedOnLetter(str: string) {
		return getColorBasedOnLetter(str || 'T');
	}

	ngOnInit() {
		setTimeout(() => {
			KTMenu.init();
			KTMenu.createInstances();
			KTMenu.updateDropdowns();
			KTMenu.hideDropdowns();
			/* KTMenu.getInstance(); */
		}, 50);
	}

	logout() {
		this.authService.logout().subscribe({
			next: (res) => {
				console.log(res);

				localStorage.removeItem('token');
				localStorage.removeItem('authUser');
				this.store.dispatch(clearUserAuth());
				this.router.navigate(['/']);
			},
			error: (err) => {
				console.log(err);

				console.log(err);
			},
		});
	}
}
