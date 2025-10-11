import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IconUsersComponent } from '../../icons/icon-users/icon-users.component';
import { IconInventoryComponent } from '@app/icons/icon-inventory/icon-inventory.component';
declare var $:any;
declare var KTLayoutAside:any;
declare var KTToggle:any;
declare var KTDrawer:any;
declare var KTUtil:any;
declare var KTScroll:any;
declare var KTScrolltop:any;
declare var KTMenu:any;
declare var KTApp:any;

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    CommonModule,
    IconUsersComponent,
    IconInventoryComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  constructor(
    public router: Router
  ){

  }
  
  ngOnInit(){
    setTimeout(() => {
      KTApp.init();
      KTUtil.init();
      KTDrawer.init();
      KTToggle.init();
      KTDrawer.updateAll();
      KTScroll.init();
      KTScrolltop.init();
      KTMenu.init();
    
    }, 50);
  }
}
