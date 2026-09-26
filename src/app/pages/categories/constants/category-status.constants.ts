export const CATEGORY_STATUS_DETAILS = {
	deactivate: [
		'La categoría ya no estará disponible en el panel.',
		'La categoría se ocultará de la tienda.',
		'Sus subcategorías se desactivará en el panel y ocultarán en la tienda.',
		'Sus productos se desactivarán en el panel y ocultarán en la tienda.',
	],
	activate: [
		'La categoría volverá a estar disponible en el panel.',
		'La categoría podrá mostrarse en la tienda.',
		'Sus subcategorías se activarán en el panel y mostrarán en la tienda.',
		'Sus productos se activarán en el panel y mostrarán en la tienda.',
	],
} as const;
