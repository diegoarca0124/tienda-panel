export const CATEGORY_STATUS_DETAILS = {
	deactivate: [
		'La categoría ya no estará disponible en el panel.',
		'La categoría se ocultará de la tienda.',
		'Sus subcategorías se desactivará en el panel y ocultarán en la tienda.',
		'Sus productos se desactivarán en el panel y ocultarán en la tienda.',
	],
	activate: [
		'La categoría se activará.',
		'Sus subcategorías conservarán su estado actual.',
		'Sus productos conservarán su estado actual y no se publicarán automáticamente.',
	],
} as const;
