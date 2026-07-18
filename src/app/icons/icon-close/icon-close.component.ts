import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-close',
  imports: [CommonModule],
  templateUrl: './icon-close.component.html',
  styleUrl: './icon-close.component.css'
})
export class IconCloseComponent {
  @Input() classIcon?: string = '';
  @Input() classSVG?: string = '';
}
