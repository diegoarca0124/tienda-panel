import {
  Directive,
  ElementRef,
  HostListener
} from '@angular/core';

@Directive({
  selector: 'img[fallbackImage]',
  standalone: true
})
export class FallbackImageDirective {

  constructor(
    private el: ElementRef<HTMLImageElement>
  ) {}

  @HostListener('error')
  onError() {
    this.el.nativeElement.src = 'images/svg/blank-image.svg';
  }
}