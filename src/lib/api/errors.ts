export class ApiError extends Error {
  public status: number;
  public data?: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function normalizeErrorMessage(status: number, data: unknown, statusText: string): string {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    if (typeof obj.detail === 'string' && obj.detail.trim().length > 0) {
      return sanitizeMessage(obj.detail);
    }

    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      return sanitizeMessage(obj.message);
    }

    if (Array.isArray(obj.non_field_errors) && obj.non_field_errors.length > 0) {
      return sanitizeMessage(obj.non_field_errors.join(' '));
    }

    const fieldErrors: string[] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val) && val.length > 0) {
        fieldErrors.push(`${key}: ${val.join(', ')}`);
      } else if (typeof val === 'string' && val.length > 0) {
        fieldErrors.push(`${key}: ${val}`);
      }
    }
    if (fieldErrors.length > 0) {
      return sanitizeMessage(fieldErrors.join('; '));
    }
  }

  if (typeof data === 'string' && data.trim().length > 0 && !data.includes('<html') && !data.includes('<!DOCTYPE')) {
    return sanitizeMessage(data);
  }

  switch (status) {
    case 400:
      return 'Invalid request data.';
    case 401:
      return 'Authentication required or session expired.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'A conflict occurred with the current resource state.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'A server error occurred. Please try again later.';
    default:
      return statusText || `Request failed with status ${status}.`;
  }
}

function sanitizeMessage(msg: string): string {
  // Strip any raw HTML tags to prevent leaking server HTML
  return msg.replace(/<[^>]*>/g, '').trim();
}
