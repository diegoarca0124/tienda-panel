import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-circle',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './icon-circle.component.html'
})
export class IconCircleComponent {
  @Input() classIcon?: string = ''; 
  @Input() classSVG?: string = ''; 
}
