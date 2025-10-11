import { Routes } from '@angular/router';
import { AuthGuard } from './common/guards/auth.guard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
	},
	{
		path: 'dashboard',
		canActivate: [AuthGuard],
		loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
	},
	{
		path: 'users/collaborators',
		children: [
			{
				path: '',
				canActivate: [AuthGuard],
				loadComponent: () =>
					import('./pages/users/collaborators/index-collaborator/index-collaborator.component').then((m) => m.IndexCollaboratorComponent),
			},
			{
				path: 'create',
				canActivate: [AuthGuard],
				loadComponent: () =>
					import('./pages/users/collaborators/create-collaborator/create-collaborator.component').then((m) => m.CreateCollaboratorComponent),
			},
			{
				path: ':id/edit',
				canActivate: [AuthGuard],
				loadComponent: () =>
					import('./pages/users/collaborators/edit-collaborator/edit-collaborator.component').then((m) => m.EditCollaboratorComponent),
			},
		],
	},
	{
		path: 'products/categories',
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/categories/index-category/index-category.component').then((m) => m.IndexCategoryComponent),
			},
			{
				path: 'create',
				loadComponent: () => import('./pages/categories/create-category/create-category.component').then((m) => m.CreateCategoryComponent),
			},
			{
				path: ':id/edit',
				loadComponent: () => import('./pages/categories/edit-category/edit-category.component').then((m) => m.EditCategoryComponent),
			},
		],
	},
	{
		path: 'products/brands',
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/brands/index-brand/index-brand.component').then((m) => m.IndexBrandComponent),
			},
			{
				path: 'create',
				loadComponent: () => import('./pages/brands/create-brand/create-brand.component').then((m) => m.CreateBrandComponent),
			},
			{
				path: ':id/edit',
				loadComponent: () => import('./pages/brands/edit-brand/edit-brand.component').then((m) => m.EditBrandComponent),
			},
		],
	},
	{
		path: 'products/attributes',
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/attributes/index-attribute/index-attribute.component').then((m) => m.IndexAttributeComponent),
			},
			{
				path: 'create',
				loadComponent: () => import('./pages/attributes/create-attribute/create-attribute.component').then((m) => m.CreateAttributeComponent),
			},
			{
				path: ':id/edit',
				loadComponent: () => import('./pages/attributes/edit-attribute/edit-attribute.component').then((m) => m.EditAttributeComponent),
			},
		],
	},
	// fallback
	{ path: '**', redirectTo: '' },
];
