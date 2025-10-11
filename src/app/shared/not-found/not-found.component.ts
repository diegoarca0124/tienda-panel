import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
	selector: 'app-not-found',
	imports: [CommonModule],
	templateUrl: './not-found.component.html',
	styleUrl: './not-found.component.css',
})
export class NotFoundComponent {
	@Input() error: any = {};
}
