import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { NavigatorService } from '@app/services/navigator.service';

@Injectable({
	providedIn: 'root',
})
export class PendingChangesGuard implements CanDeactivate<any> {
	constructor(private navigatorService: NavigatorService) {}

	canDeactivate(component: any): boolean | Promise<boolean> {
		if (!component.hasPendingChanges()) {
			return true;
		}

		return this.navigatorService.open();
	}
}
