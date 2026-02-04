import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-dialer',
  imports: [
    FormsModule
  ],
  templateUrl: './input-dialer.component.html',
  styleUrl: './input-dialer.component.css'
})
export class InputDialerComponent {
  
  /** Valor real (number) */
  @Input() value: number | null = null;
  @Output() valueChange = new EventEmitter<number | null>();

  /** Valor visual (string) */
  inputValue = '';

  @Input() step = 1;
  @Input() placeholder = '';

  ngOnChanges() {
    this.inputValue = this.value?.toString() ?? '';
  }

  increment() {
    const next = (this.value ?? 0) + this.step;
    this.updateValue(next);
  }

  decrement() {
    const next = Math.max(0, (this.value ?? 0) - this.step);
    this.updateValue(next);
  }

  onInput(val: string) {
    this.inputValue = val;

    if (val === '') {
      this.value = null;
      this.valueChange.emit(null);
      return;
    }

    const num = Number(val);
    if (!isNaN(num)) {
      this.updateValue(num);
    }
  }

  private updateValue(num: number) {
    this.value = num;
    this.inputValue = num.toString();
    this.valueChange.emit(num);
  }
}
