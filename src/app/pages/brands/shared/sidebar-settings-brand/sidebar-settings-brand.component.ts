import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
	selector: 'app-sidebar-settings-brand',
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './sidebar-settings-brand.component.html',
	styleUrl: './sidebar-settings-brand.component.css',
})
export class SidebarSettingsBrandComponent {
	public readonly menuItems = [
		{ id: 'brand', path: ['settings', 'brand'], label: 'Marca', description: 'Configuración general', icon: 'bi-tags' },
	];

	constructor(private readonly route: ActivatedRoute) {}

	public get brandId(): string {
		return this.route.snapshot.paramMap.get('id') ?? '';
	}
}
