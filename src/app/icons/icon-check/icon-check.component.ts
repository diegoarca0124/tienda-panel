import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-check',
  imports: [CommonModule],
  templateUrl: './icon-check.component.html',
})
export class IconCheckComponent {
  @Input() classIcon?: string = '';
  @Input() classSVG?: string = '';
}
