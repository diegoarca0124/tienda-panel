import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconAlertComponent } from '@app/icons/icon-alert/icon-alert.component';

@Component({
	selector: 'app-alert',
	imports: [IconAlertComponent, CommonModule],
	templateUrl: './alert.component.html',
	styleUrl: './alert.component.css',
})
export class AlertComponent {
	@Input() classAlert: string = '';
	@Input() title: string = '';
	@Input() classIcon: string = '';
	@Input() description: { [key: string]: string[] } = {};
	@Input() text: string = '';
	@Input() type: string = '';
}
