import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-upload',
  imports: [
    CommonModule
  ],
  templateUrl: './icon-upload.component.html',
  styleUrl: './icon-upload.component.css'
})
export class IconUploadComponent {
  @Input() classIcon?: string = ''; 
  @Input() classSVG?: string = ''; 
}
