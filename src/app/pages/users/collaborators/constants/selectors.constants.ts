import { prefixNumbers } from '@app/common/constants/prefixNumbers.constant';

export const sortOptions = [
	{
		name: 'Predeterminado',
		value: 'Predeterminado',
		icon: 'swap-vertical-outline',
	},

	{
		name: 'Nombres ASC',
		value: 'names:asc',
		icon: 'arrow-up-outline',
	},
	{
		name: 'Nombres DES',
		value: 'names:desc',
		icon: 'arrow-down-outline',
	},

	{
		name: 'Email ASC',
		value: 'email:asc',
		icon: 'arrow-up-outline',
	},
	{
		name: 'Email DES',
		value: 'email:desc',
		icon: 'arrow-down-outline',
	},

	{
		name: 'Documento ID ASC',
		value: 'number_document:asc',
		icon: 'arrow-up-outline',
	},
	{
		name: 'Documento ID DES',
		value: 'number_document:desc',
		icon: 'arrow-down-outline',
	},
];

export const statusOptions = [
	{ name: 'Todos', value: 'Todos', color: 'primary' },
	{ name: 'Activos', value: 'Activos', color: 'success' },
	{ name: 'Inactivos', value: 'Inactivos', color: 'danger' },
];

export const rolesOptions = [
	{ name: 'Admin', value: 'Admin' },
	{ name: 'Editor', value: 'Editor' },
	{ name: 'DEFAULT', value: 'DEFAULT' },
];

export const documentsOptions = [
	{ name: 'DNI', value: 'DNI' },
	{ name: 'CE - Carné de Extranjería', value: 'CE - Carné de Extranjería' },
	{ name: 'Pasaporte', value: 'Pasaporte' },
];

export const fieldsExportOptions = [
	{
		key: 'names',
		checked: true,
		label: 'Nombres',
		description: 'Nombres registrados del colaborador.',
	},
	{
		key: 'surname',
		checked: true,
		label: 'Apellidos',
		description: 'Apellidos registrados del colaborador.',
	},
	{
		key: 'type_document',
		checked: true,
		label: 'Tipo de documento',
		description: 'Tipo de identificación registrada.',
	},
	{
		key: 'number_document',
		checked: true,
		label: 'Número de documento',
		description: 'Número del documento de identificación.',
	},
	{
		key: 'email',
		checked: true,
		label: 'Correo electrónico',
		description: 'Dirección de correo electrónico registrada.',
	},
	{
		key: 'prefix',
		checked: true,
		label: 'Prefijo telefónico',
		description: 'Código telefónico asociado al país.',
	},
	{
		key: 'phone',
		checked: true,
		label: 'Teléfono',
		description: 'Número telefónico de contacto.',
	},
	{
		key: 'role',
		checked: true,
		label: 'Rol',
		description: 'Rol y nivel de acceso asignado.',
	},
	{
		key: 'status',
		checked: true,
		label: 'Estado',
		description: 'Estado actual de la cuenta.',
	},
	{
		key: 'createdAt',
		checked: true,
		label: 'Fecha de creación',
		description: 'Fecha en que se creó el colaborador.',
	},
	{
		key: 'updatedAt',
		checked: true,
		label: 'Última actualización',
		description: 'Fecha de la modificación más reciente.',
	},
	{
		key: 'statusAt',
		checked: true,
		label: 'Último cambio de estado',
		description: 'Fecha del cambio de estado más reciente.',
	},
	{
		key: 'lastDatelogin',
		checked: true,
		label: 'Último acceso',
		description: 'Fecha del último inicio de sesión.',
	},
];

export const fieldImportOptions = [
	{
		index: 1,
		key: 'names',
		label: 'Nombres',
		description: 'Incluye los nombres del colaborador',
		inputType: 'input',
	},
	{
		index: 2,
		key: 'surname',
		label: 'Apellidos',
		description: 'Incluye los apellidos del colaborador',
		inputType: 'input',
	},
	{
		index: 3,
		key: 'type_document',
		label: 'Tipo de documento',
		description: 'Tipo de identificación del colaborador',
		inputType: 'select',
		inputValues: documentsOptions.map((prev) => ({ ...prev, value: prev.name })),
	},
	{
		index: 4,
		key: 'number_document',
		label: 'Número de documento',
		description: 'Documento de identidad',
		inputType: 'input',
	},
	{
		index: 5,
		key: 'email',
		label: 'Correo electrónico',
		description: 'Email registrado',
		inputType: 'input',
	},
	{
		index: 6,
		key: 'prefix',
		label: 'Prefijo Telefónico',
		description: 'Prefijo del país',
		inputType: 'select',
		inputValues: prefixNumbers,
	},
	{
		index: 7,
		key: 'phone',
		label: 'Teléfono',
		description: 'Número de contacto',
		inputType: 'input',
	},
	{
		index: 8,
		key: 'role',
		label: 'Rol',
		description: 'Rol asignado en el sistema',
		inputType: 'select',
		inputValues: rolesOptions,
	},
	{
		index: 9,
		key: 'status',
		label: 'Estado',
		description: 'Estado actual del colaborador',
		inputType: 'select',
		inputValues: [
			{ name: 'Activo', value: true },
			{ name: 'Inactivo', value: false },
		],
	},
];
