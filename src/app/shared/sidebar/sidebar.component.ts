import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { IconUsersComponent } from '../../icons/icon-users/icon-users.component';
import { IconInventoryComponent } from '@app/icons/icon-inventory/icon-inventory.component';
declare var $: any;
declare var KTLayoutAside: any;
declare var KTToggle: any;
declare var KTDrawer: any;
declare var KTUtil: any;
declare var KTScroll: any;
declare var KTScrolltop: any;
declare var KTMenu: any;
declare var KTApp: any;

@Component({
	selector: 'app-sidebar',
	imports: [RouterModule, CommonModule, IconUsersComponent, IconInventoryComponent],
	templateUrl: './sidebar.component.html',
	styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
	private readonly destroy$ = new Subject<void>();
	private initializationTimer?: ReturnType<typeof setTimeout>;
	public expandedMenu: 'users' | 'products' | null = null;
	public animateMenu = false;

	constructor(public router: Router) {}

	ngOnInit() {
		this.syncExpandedMenu(this.router.url);
		this.router.events
			.pipe(
				filter((event): event is NavigationEnd => event instanceof NavigationEnd),
				takeUntil(this.destroy$)
			)
			.subscribe((event) => {
				this.syncExpandedMenu(event.urlAfterRedirects);
			});
		this.initializationTimer = setTimeout(() => {
			KTApp.init();
			KTUtil.init();
			KTDrawer.init();
			KTToggle.init();
			KTDrawer.updateAll();
			KTScroll.init();
			KTScrolltop.init();
			KTMenu.init();
		}, 50);
	}

	ngOnDestroy(): void {
		clearTimeout(this.initializationTimer);
		this.destroy$.next();
		this.destroy$.complete();
	}

	toggleMenu(menu: 'users' | 'products'): void {
		this.animateMenu = true;
		this.expandedMenu = this.expandedMenu === menu ? null : menu;
	}

	private syncExpandedMenu(url: string): void {
		this.animateMenu = false;
		this.expandedMenu = url.startsWith('/users') ? 'users' : url.startsWith('/products') ? 'products' : null;
	}
}
