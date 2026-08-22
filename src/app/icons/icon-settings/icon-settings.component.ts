import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-icon-settings',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './icon-settings.component.html',
})
export class IconSettingsComponent {
	@Input() classIcon: string = '';
}
