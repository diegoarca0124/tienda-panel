import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
	selector: 'app-validation-popover',
	imports: [CommonModule],
	templateUrl: './validation-popover.component.html',
	styleUrl: './validation-popover.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ValidationPopoverComponent {
	@Input() errors: string[] = [];
}
