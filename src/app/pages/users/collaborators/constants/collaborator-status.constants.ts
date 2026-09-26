export const COLLABORATOR_STATUS_DETAILS = {
	deactivate: [
		'No podrá ingresar al sistema hasta que vuelvas a activar la cuenta.',
		'Sus sesiones activas y tokens de acceso serán revocados.',
		'Su información y los permisos asignados se conservarán.',
	],
	activate: [
		'Podrá volver a iniciar sesión con sus credenciales.',
		'Recuperará los permisos correspondientes a su rol.',
		'Sus datos y su historial permanecerán sin cambios.',
	],
} as const;
