import { describe, it, expect } from 'vitest';
import { ApiError, isApiError } from '../errors';

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
});
