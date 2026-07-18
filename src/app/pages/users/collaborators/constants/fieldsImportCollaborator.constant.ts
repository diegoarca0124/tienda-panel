import { identityDocuments } from "@app/common/constants/identityDocuments.constant";
import { prefixNumbers } from "@app/common/constants/prefixNumbers.constant";
import { rols } from "@app/common/constants/rols.constant";

export const fieldsImportCollaborator = [
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
		inputValues: identityDocuments.map(prev=>({...prev, value: prev.name}))
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
		inputValues: prefixNumbers
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
		inputValues: rols,
	},
    {
		index: 9,
		key: 'status',
		label: 'Estado',
		description: 'Estado actual del colaborador',
		inputType: 'select',
		inputValues: [
			{ name: 'Activo', value: true },
			{ name: 'Inactivo', value: false }
		]
	},
];