import { describe, it, expect } from 'vitest';
import { ApiError, isApiError, normalizeErrorMessage } from '../errors';

describe('API Errors', () => {
  it('should correctly construct an ApiError', () => {
    const err = new ApiError(404, 'Not found', { detail: 'Not found' });
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not found');
    expect(err.data).toEqual({ detail: 'Not found' });
  });

  it('should correctly identify ApiError instances', () => {
    const apiErr = new ApiError(500, 'Server Error');
    const normalErr = new Error('Normal Error');

    expect(isApiError(apiErr)).toBe(true);
    expect(isApiError(normalErr)).toBe(false);
  });

  describe('normalizeErrorMessage', () => {
    it('normalizes detail string', () => {
      const msg = normalizeErrorMessage(400, { detail: 'Custom error detail' }, 'Bad Request');
      expect(msg).toBe('Custom error detail');
    });

    it('normalizes field errors object', () => {
      const msg = normalizeErrorMessage(400, { email: ['Invalid email'], name: ['Required'] }, 'Bad Request');
      expect(msg).toBe('email: Invalid email; name: Required');
    });

    it('normalizes non_field_errors array', () => {
      const msg = normalizeErrorMessage(400, { non_field_errors: ['Invalid credentials'] }, 'Bad Request');
      expect(msg).toBe('Invalid credentials');
    });

    it('strips raw HTML from error messages', () => {
      const msg = normalizeErrorMessage(500, '<html><body><h1>Server Error</h1><p>Traceback</p></body></html>', 'Internal Server Error');
      expect(msg).toBe('A server error occurred. Please try again later.');
    });

    it('provides standard fallback for 401, 403, 404, 409, 500', () => {
      expect(normalizeErrorMessage(401, null, '')).toBe('Authentication required or session expired.');
      expect(normalizeErrorMessage(403, null, '')).toBe('You do not have permission to perform this action.');
      expect(normalizeErrorMessage(404, null, '')).toBe('The requested resource was not found.');
      expect(normalizeErrorMessage(409, null, '')).toBe('A conflict occurred with the current resource state.');
      expect(normalizeErrorMessage(500, null, '')).toBe('A server error occurred. Please try again later.');
    });
  });
});
