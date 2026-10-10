import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CollaboratorInterface } from '../../../interfaces/collaborator.interface';

@Component({
	selector: 'app-sesions-modal-index-collaborator',
	imports: [],
	templateUrl: './sesions-modal-index-collaborator.component.html',
	styleUrl: './sesions-modal-index-collaborator.component.css',
})
export class SesionsModalIndexCollaboratorComponent {
	@Input() collaborator: Pick<CollaboratorInterface, 'id' | 'names' | 'surname' | 'status'> | null = null;
	@Input() isLoading: boolean = false;
	@Input() errorMessage: string | null = null;
	@Output() confirmRequested = new EventEmitter<void>();
}
