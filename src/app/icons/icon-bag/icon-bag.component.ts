import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-bag',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './icon-bag.component.html'
})
export class IconBagComponent {
  @Input() classIcon?: string = ''; 
  @Input() classSVG?: string = ''; 
}
