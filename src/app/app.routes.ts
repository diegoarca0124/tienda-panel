import { Routes } from '@angular/router';
import { AuthGuard } from './common/guards/auth.guard';
import { PendingChangesGuard } from './common/guards/pending-changes.guard';

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
				loadComponent: () => import('./pages/users/collaborators/index-collaborator/index-collaborator.component').then((m) => m.IndexCollaboratorComponent),
			},
			{
				path: 'create',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/users/collaborators/create-collaborator/create-collaborator.component').then((m) => m.CreateCollaboratorComponent),
			},
			{
				path: ':id/edit',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/users/collaborators/edit-collaborator/edit-collaborator.component').then((m) => m.EditCollaboratorComponent),
			},
			{
				path: 'import',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/users/collaborators/import-collaborator/import-collaborator.component').then((m) => m.ImportCollaboratorComponent),
			},
			{
				path: 'export',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/users/collaborators/export-collaborator/export-collaborator.component').then((m) => m.ExportCollaboratorComponent),
			},
		],
	},
	{
		path: 'products/categories',
		children: [
			{
				path: '',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/categories/index-category/index-category.component').then((m) => m.IndexCategoryComponent),
			},
			{
				path: 'create',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/categories/create-category/create-category.component').then((m) => m.CreateCategoryComponent),
			},
			{
				path: ':id/edit',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/categories/edit-category/edit-category.component').then((m) => m.EditCategoryComponent),
			},
			{
				path: ':id/products',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/categories/products-category/products-category.component').then((m) => m.ProductsCategoryComponent),
			},
			{
				path: 'mapping',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/categories/mapping-category/mapping-category.component').then((m) => m.MappingCategoryComponent),
			},
		],
	},
	{
		path: 'products/brands',
		children: [
			{
				path: '',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/brands/index-brand/index-brand.component').then((m) => m.IndexBrandComponent),
			},
			{
				path: 'create',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/brands/create-brand/create-brand.component').then((m) => m.CreateBrandComponent),
			},
			{
				path: ':id/edit',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/brands/edit-brand/edit-brand.component').then((m) => m.EditBrandComponent),
			},
			{
				path: ':id/products',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/brands/products-brand/products-brand.component').then((m) => m.ProductsBrandComponent),
			},
		],
	},
	{
		path: 'products/attributes',
		children: [
			{
				path: 'groups',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/attributes/index-group-attribute/index-group-attribute.component').then((m) => m.IndexGroupAttributeComponent),
			},
			{
				path: 'groups/create',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/attributes/create-group-attribute/create-group-attribute.component').then((m) => m.CreateGroupAttributeComponent),
			},
			{
				path: 'groups/:id/edit',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/attributes/edit-group-attribute/edit-group-attribute.component').then((m) => m.EditGroupAttributeComponent),
			},
			{
				path: 'groups/:id/attributes',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/attributes/index-attribute/index-attribute.component').then((m) => m.IndexAttributeComponent),
			},
			{
				path: 'groups/:id/attributes/create',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/attributes/create-attribute/create-attribute.component').then((m) => m.CreateAttributeComponent),
			},
			{
				path: 'groups/:id/attributes/:idAttribute/edit',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/attributes/edit-attribute/edit-attribute.component').then((m) => m.EditAttributeComponent),
			},
		],
	},
	{
		path: 'products/articles',
		children: [
			{
				path: '',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/products/index-product/index-product.component').then((m) => m.IndexProductComponent),
			},
			{
				path: 'create',
				canActivate: [AuthGuard],
				canDeactivate: [PendingChangesGuard],
				loadComponent: () => import('./pages/products/create-product/create-product.component').then((m) => m.CreateProductComponent),
			},
			{
				path: ':id/edit',
				canActivate: [AuthGuard],
				loadComponent: () => import('./pages/products/edit-product/edit-product.component').then((m) => m.EditProductComponent),
			},
		],
	},
	// fallback
	{ path: '**', redirectTo: '' },
];
