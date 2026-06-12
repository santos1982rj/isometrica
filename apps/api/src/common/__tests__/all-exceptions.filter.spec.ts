import { HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from '../filters/all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  it('hides internal messages for non-HTTP errors', () => {
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
      }),
    };

    new AllExceptionsFilter().catch(new Error('Prisma SQL connection failed'), host as any);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro interno do servidor',
      }),
    );
  });
});
