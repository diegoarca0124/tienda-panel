const DEFAULT_ERROR_MESSAGE = 'No se pudo completar la solicitud.';

export interface HttpErrorBody {
	message: string;
	statusCode: number;
	validation?: any;
}

/** Conserva los datos del backend y garantiza un mensaje aunque la respuesta esté vacía. */
export function getHttpErrorBody(error: unknown, fallbackMessage = DEFAULT_ERROR_MESSAGE): HttpErrorBody {
	const response = error as { error?: unknown; status?: number } | null | undefined;
	const body = response?.error;
	const payload: Record<string, any> = body && typeof body === 'object' && !Array.isArray(body) ? { ...body } : {};
	const rawMessage = payload['message'];
	const message = Array.isArray(rawMessage) ? rawMessage.filter((item): item is string => typeof item === 'string').join(' ') : rawMessage;
	const textBody = typeof body === 'string' && !body.trim().startsWith('<') ? body.trim() : '';

	if (!payload['validation'] || typeof payload['validation'] !== 'object' || Array.isArray(payload['validation'])) {
		delete payload['validation'];
	}

	return {
		...payload,
		message: typeof message === 'string' && message.trim() ? message : textBody || fallbackMessage,
		statusCode: typeof payload['statusCode'] === 'number' ? payload['statusCode'] : (response?.status ?? 0),
	};
}
