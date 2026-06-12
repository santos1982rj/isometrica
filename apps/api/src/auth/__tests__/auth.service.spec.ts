import { AuthService } from '../auth.service';

describe('AuthService', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const mockJwt = {
    sign: vi.fn().mockReturnValue('jwt-token'),
  };

  const mockEmail = {
    sendWelcome: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('always creates public signups as STUDENT even if a privileged role is sent', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ id: 'user-1', email: 'ana@email.com' });

    const service = new AuthService(mockPrisma as any, mockJwt as any, mockEmail as any);

    await service.cadastro({
      email: 'ana@email.com',
      senha: '123456',
      nome: 'Ana',
      papel: 'ADMIN',
    } as any);

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: 'ana@email.com',
        role: 'STUDENT',
      }),
    });
  });
});
