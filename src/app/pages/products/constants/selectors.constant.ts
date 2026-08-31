export const visibilityOptions = [
	{
		name: 'Todos',
		value: 'Todos',
		icon: 'list-outline',
	},
	{
		name: 'Público',
		value: 'public',
		icon: 'eye-outline',
	},
	{
		name: 'Privado',
		value: 'private',
		icon: 'eye-off-outline',
	},
];

export const qualityOptions = [
	{ name: 'Todos', value: 'Todos', color: `primary` },
	{ name: 'Alta', value: 'high', color: 'success' },
	{ name: 'Media', value: 'medium', color: 'warning' },
	{ name: 'Baja', value: 'low', color: 'danger' },
];


export const sortOptions = [
	{ name: 'Predeterminado', value: 'Predeterminado', icon: 'swap-vertical-outline' },
	{ name: 'Nombre A → Z', value: 'name:asc', icon: 'text-outline' },
	{ name: 'Nombre Z → A', value: 'name:desc', icon: 'text-outline' },
	{ name: 'Precio Menor', value: 'priceRegular:asc', icon: 'cash-outline' },
	{ name: 'Precio Mayor', value: 'priceRegular:desc', icon: 'cash-outline' },
	{ name: 'Calidad Baja', value: 'quality:asc', icon: 'star-half-outline' },
	{ name: 'Calidad Alta', value: 'quality:desc', icon: 'star-outline' },
	{ name: 'Stock Menor', value: 'stockQuantity:asc', icon: 'cube-outline' },
	{ name: 'Stock Mayor', value: 'stockQuantity:desc', icon: 'cube-outline' },
];

export const statusOptions = [
	{ name: 'Todos', value: 'Todos', color: 'primary' },
	{ name: 'Publicado', value: 'published', color: 'success' },
	{ name: 'Borrador', value: 'draft', color: 'warning' },
];