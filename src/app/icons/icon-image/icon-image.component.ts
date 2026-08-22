import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-icon-image',
	imports: [CommonModule],
	templateUrl: './icon-image.component.html',
	styleUrl: './icon-image.component.css',
})
export class IconImageComponent {
	@Input() classIcon?: string = '';
	@Input() classSVG?: string = '';
}
