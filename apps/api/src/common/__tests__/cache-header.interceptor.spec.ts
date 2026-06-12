import { of } from 'rxjs';
import { CacheHeaderInterceptor } from '../interceptors/cache-header.interceptor';

describe('CacheHeaderInterceptor', () => {
  it('does not apply public cache headers to authenticated GET requests', () => {
    const response = { setHeader: vi.fn() };
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', user: { id: 'user-1' } }),
        getResponse: () => response,
      }),
    };
    const next = { handle: () => of({ ok: true }) };

    new CacheHeaderInterceptor().intercept(context as any, next as any).subscribe();

    expect(response.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store');
  });
});
