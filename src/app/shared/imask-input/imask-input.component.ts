import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
declare const jSuites: any;

@Component({
  selector: 'app-imask-input',
  templateUrl: './imask-input.component.html',
  styleUrls: ['./imask-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImaskInputComponent),
      multi: true,
    },
  ]
})
export class ImaskInputComponent {
  @Input() placeholder: string = '';
  @Input() unit: string = '';  // Ej: "kg", "cm", "l"
  @Input() maskPattern: string = '';  // Patrón de máscara jSuites

  @ViewChild('inputElement', { static: true }) inputElement!: ElementRef<HTMLInputElement>;

  ngAfterViewInit() {
    const el = this.inputElement.nativeElement;

    // Configuración usando data-mask
    el.setAttribute('data-mask', this.maskPattern + ' ' + this.unit);

    // Inicializar jSuites mask
    jSuites.mask.runAll();  // o el método apropiado según versión
  }

  getValue(): string {
    return this.inputElement.nativeElement.value.replace(` ${this.unit}`, '').trim();
  }
}
