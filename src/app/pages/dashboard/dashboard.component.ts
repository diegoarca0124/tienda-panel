import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TopbarComponent } from '../../shared/topbar/topbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    TopbarComponent,
    SidebarComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
