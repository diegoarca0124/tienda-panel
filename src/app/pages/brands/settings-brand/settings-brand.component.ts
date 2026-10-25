import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { SidebarSettingsBrandComponent } from './shared/sidebar-settings-brand/sidebar-settings-brand.component';

@Component({
	selector: 'app-settings-brand',
	imports: [RouterModule, SidebarComponent, TopbarComponent, SidebarSettingsBrandComponent],
	templateUrl: './settings-brand.component.html',
	styleUrl: './settings-brand.component.css',
})
export class SettingsBrandComponent {}
