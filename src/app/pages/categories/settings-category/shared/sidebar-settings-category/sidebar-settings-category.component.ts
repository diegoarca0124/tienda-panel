import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export type SettingsSection = 'category' | 'create-subcategory' | 'subcategories' | 'products' | 'brands';

interface SettingsMenuItem {
	id: SettingsSection;
	label: string;
	description: string;
	icon: string;
}

@Component({
	selector: 'app-sidebar-settings-category',
	imports: [RouterLink, RouterLinkActive],
	templateUrl: './sidebar-settings-category.component.html',
	styleUrl: './sidebar-settings-category.component.css',
})
export class SidebarSettingsCategoryComponent {
	public readonly menuItems: SettingsMenuItem[] = [
		{
			id: 'category',
			label: 'Categoría',
			description: 'Configuración general',
			icon: 'bi-folder2-open',
		},
		{
			id: 'create-subcategory',
			label: 'Crear subcategoría',
			description: 'Registrar una nueva',
			icon: 'bi-folder-plus',
		},
		{
			id: 'subcategories',
			label: 'Subcategorías',
			description: 'Configuración relacionada',
			icon: 'bi-diagram-3',
		},
		/* {
			id: 'products',
			label: 'Productos',
			description: 'Artículos de la categoría',
			icon: 'bi-box-seam',
		}, */
		{
			id: 'brands',
			label: 'Marcas',
			description: 'Marcas de la categoría',
			icon: 'bi-tags',
		},
	];
}
