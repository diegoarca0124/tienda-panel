import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { SidebarSettingsAttributeComponent } from './shared/sidebar-settings-attribute/sidebar-settings-attribute.component';

@Component({
	selector: 'app-settings-attribute',
	imports: [RouterModule, SidebarComponent, TopbarComponent, SidebarSettingsAttributeComponent],
	templateUrl: './settings-attribute.component.html',
	styleUrl: './settings-attribute.component.css',
})
export class SettingsAttributeComponent {}
