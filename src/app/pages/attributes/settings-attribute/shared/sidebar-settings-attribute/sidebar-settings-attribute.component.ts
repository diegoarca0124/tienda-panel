import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-sidebar-settings-attribute',
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './sidebar-settings-attribute.component.html',
	styleUrl: './sidebar-settings-attribute.component.css',
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarSettingsAttributeComponent {
	public readonly menuItems = [{ id: 'group-attribute', path: ['settings', 'group-attribute'], label: 'Grupo', description: 'Configuración general', icon: 'layers-outline' }];

	constructor(private readonly route: ActivatedRoute) {}

	public get groupId(): string {
		return this.route.snapshot.paramMap.get('id') ?? '';
	}
}
