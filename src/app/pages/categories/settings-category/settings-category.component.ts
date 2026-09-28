import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '@app/shared/sidebar/sidebar.component';
import { TopbarComponent } from '@app/shared/topbar/topbar.component';
import { EditCategoryComponent } from './components/edit-category/edit-category.component';
import { IndexSubcategoryComponent } from './components/index-subcategory/index-subcategory.component';
import { ArticlesCategoryComponent } from './components/articles-category/articles-category.component';
import { CreateSubcategoryComponent } from './components/create-subcategory/create-subcategory.component';

type SettingsSection = 'category' | 'create-subcategory' | 'subcategories' | 'products';

interface SettingsMenuItem {
	id: SettingsSection;
	label: string;
	description: string;
	icon: string;
}

@Component({
	selector: 'app-settings-category',
	imports: [RouterModule, TopbarComponent, SidebarComponent, EditCategoryComponent, CreateSubcategoryComponent, IndexSubcategoryComponent, ArticlesCategoryComponent],
	templateUrl: './settings-category.component.html',
	styleUrl: './settings-category.component.css',
})
export class SettingsCategoryComponent {
	public activeSection: SettingsSection = 'category';

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
		{
			id: 'products',
			label: 'Productos',
			description: 'Artículos de la categoría',
			icon: 'bi-box-seam',
		},
	];

	public setActiveSection(section: SettingsSection): void {
		this.activeSection = section;
	}
}
