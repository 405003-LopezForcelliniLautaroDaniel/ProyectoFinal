export function extractApiErrorMessage(err: any): string {
  // Axios error shapes
  const res = err?.response;
  const data = res?.data;

  // Common fields used by many APIs
  const candidates: Array<any> = [
    data?.mensajeError,  // Para el caso de suscripción expirada
    data?.message,
    data?.Message,
    data?.error,
    data?.error_description,
    data?.detail,
    data?.title,
  ];

  // ASP.NET ModelState: { errors: { field: ["msg"] } } o ProblemDetails { errors }
  if (data?.errors && typeof data.errors === 'object') {
    const messages: string[] = [];
    for (const key of Object.keys(data.errors)) {
      const value = data.errors[key];
      if (Array.isArray(value)) {
        messages.push(...value);
      } else if (typeof value === 'string') {
        messages.push(value);
      }
    }
    if (messages.length) return messages.join(' \n');
  }

  // If any candidate string exists, return first non-empty
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c;
  }

  // Fallbacks
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof err?.message === 'string' && err.message.trim()) return err.message;

  return 'Ocurrió un error inesperado.';
}


