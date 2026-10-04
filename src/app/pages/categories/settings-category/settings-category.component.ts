import { SidebarSettingsCategoryComponent } from './shared/sidebar-settings-category/sidebar-settings-category.component';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';

@Component({
	selector: 'app-settings-category',
	imports: [SidebarSettingsCategoryComponent, RouterModule, TopbarComponent, SidebarComponent],
	templateUrl: './settings-category.component.html',
	styleUrl: './settings-category.component.css',
})
export class SettingsCategoryComponent {}
