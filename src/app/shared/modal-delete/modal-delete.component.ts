import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output, signal, Signal } from '@angular/core';

@Component({
  selector: 'app-modal-delete',
  imports: [
    CommonModule,
  ],
  templateUrl: './modal-delete.component.html',
  styleUrl: './modal-delete.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ModalDeleteComponent {
  @Input() id: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() textButton: string = '';
  @Output() actionConfirmed = new EventEmitter(); // Emite el ID del elemento a eliminar
  @Input() loadBtnDelete: Signal<boolean> = signal(false);

  constructor(){

  }

  closeModal() {
    const modalElement = document.getElementById(this.id);
    if (modalElement) {
      modalElement.style.display = 'none';
    }
  }

  onActionConfirmed(): void {
    this.actionConfirmed.emit(); 
  }
}
