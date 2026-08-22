import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NavigatorService } from '@app/services/navigator.service';

@Component({
	selector: 'app-modal-exit',
	imports: [CommonModule],
	templateUrl: './modal-exit.component.html',
	styleUrl: './modal-exit.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalExitComponent {
	constructor(private navigatorService: NavigatorService) {}

	confirmExit() {
		this.navigatorService.confirm();
	}

	cancelExit() {
		this.navigatorService.cancel();
	}
}
