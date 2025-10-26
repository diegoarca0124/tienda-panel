import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ModalDeleteComponent } from '@app/shared/modal-delete/modal-delete.component';
import { NotFoundComponent } from '@app/shared/not-found/not-found.component';
import { PaginationComponent } from '@app/shared/pagination/pagination.component';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';

@Component({
  selector: 'app-index-product',
  imports: [TopbarComponent, SidebarComponent, RouterModule, CommonModule, FormsModule],
  templateUrl: './index-product.component.html',
  styleUrl: './index-product.component.css'
})
export class IndexProductComponent {

}
