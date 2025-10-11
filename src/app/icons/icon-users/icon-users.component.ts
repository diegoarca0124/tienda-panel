import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon-users',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './icon-users.component.html'
})
export class IconUsersComponent {
  @Input() classIcon: string = ''; 
}
