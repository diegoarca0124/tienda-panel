import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-icon-papers',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './icon-papers.component.html',
})
export class IconPapersComponent {
	@Input() classIcon?: string = '';
	@Input() classSVG?: string = '';
}
