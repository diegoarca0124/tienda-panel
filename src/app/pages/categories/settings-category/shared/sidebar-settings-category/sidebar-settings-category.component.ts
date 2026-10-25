import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SidebarSettingsCategoryComponent {
	public readonly menuItems: SettingsMenuItem[] = [
		{
			id: 'category',
			label: 'Categoría',
			description: 'Configuración general',
			icon: 'folder-open-outline',
		},
		{
			id: 'create-subcategory',
			label: 'Crear subcategoría',
			description: 'Registrar una nueva',
			icon: 'add-circle-outline',
		},
		{
			id: 'subcategories',
			label: 'Subcategorías',
			description: 'Configuración relacionada',
			icon: 'git-network-outline',
		},
		/* {
			id: 'products',
			label: 'Productos',
			description: 'Artículos de la categoría',
			icon: 'cube-outline',
		}, */
		{
			id: 'brands',
			label: 'Marcas',
			description: 'Marcas de la categoría',
			icon: 'pricetags-outline',
		},
	];
}
