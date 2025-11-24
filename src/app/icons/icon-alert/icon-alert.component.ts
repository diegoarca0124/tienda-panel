import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-alert',
  imports: [
    CommonModule
  ],
  templateUrl: './icon-alert.component.html'
})
export class IconAlertComponent {
  @Input() classIcon?: string = ''; 
  @Input() classSVG?: string = '';
}
