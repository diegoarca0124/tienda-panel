import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: 'textarea[textAreaAutoResize]',
  standalone: true
})
export class TextareaAutoresizeDirective implements AfterViewInit {
  private resizeObserver?: ResizeObserver;

  constructor(private readonly el: ElementRef<HTMLTextAreaElement>) {}

  ngAfterViewInit(): void {
    this.resize();

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });

    this.resizeObserver.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  @HostListener('input')
  onInput(): void {
    this.resize();
  }

  public resize(): void {
    const textarea = this.el.nativeElement;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}