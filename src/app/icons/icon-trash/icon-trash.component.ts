import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-icon-trash',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './icon-trash.component.html',
})
export class IconTrashComponent {
	@Input() classIcon?: string = '';
	@Input() classSVG?: string = '';
}
