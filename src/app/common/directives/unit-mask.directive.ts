import {
  Directive,
  ElementRef,
  Input,
  Renderer2,
  AfterViewInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';

@Directive({
  selector: '[unitMask]',
  standalone: true
})
export class UnitMaskDirective
  implements AfterViewInit, OnChanges {

  @Input() unitMask = '';

  private suffixElement!: HTMLElement;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private renderer: Renderer2
  ) {}

  ngAfterViewInit(): void {

    const input = this.el.nativeElement;

    const wrapper = this.renderer.createElement('div');

    this.renderer.setStyle(wrapper, 'position', 'relative');
    this.renderer.setStyle(wrapper, 'width', '100%');

    const parent = input.parentNode;

    if (!parent) return;

    parent.insertBefore(wrapper, input);

    wrapper.appendChild(input);

    this.suffixElement = this.renderer.createElement('span');

    this.renderer.setStyle(this.suffixElement, 'position', 'absolute');
    this.renderer.setStyle(this.suffixElement, 'right', '12px');
    this.renderer.setStyle(this.suffixElement, 'top', '50%');
    this.renderer.setStyle(
      this.suffixElement,
      'transform',
      'translateY(-50%)'
    );
    this.renderer.setStyle(
      this.suffixElement,
      'pointer-events',
      'none'
    );
    this.renderer.setStyle(
      this.suffixElement,
      'color',
      '#6c757d'
    );
    this.renderer.setStyle(
      this.suffixElement,
      'font-size',
      '1rem'
    );

    this.suffixElement.innerText = this.unitMask;

    wrapper.appendChild(this.suffixElement);

    this.renderer.setStyle(
      input,
      'padding-right',
      '50px'
    );
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (
      changes['unitMask'] &&
      this.suffixElement
    ) {
      this.suffixElement.innerText =
        this.unitMask || '';
    }

  }
}