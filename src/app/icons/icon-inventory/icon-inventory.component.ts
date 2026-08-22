import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-icon-inventory',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './icon-inventory.component.html',
})
export class IconInventoryComponent {
	@Input() classIcon: string = '';
}
