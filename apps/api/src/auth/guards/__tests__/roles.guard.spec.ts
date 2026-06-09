import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../roles.guard';
import { UserRole } from '../../../generated/prisma/enums';

function createMockContext(roles?: UserRole[], userPapel?: string) {
  const handler = () => {};
  const mockReflector = {
    getAllAndOverride: vi.fn().mockReturnValue(roles ?? null),
  } as unknown as vi.Mocked<Reflector>;

  const guard = new RolesGuard(mockReflector);

  const mockRequest = {
    user: userPapel ? { papel: userPapel } : undefined,
  };

  const executionContext = {
    getHandler: () => handler,
    getClass: () => ({} as any),
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as any;

  return { guard, mockReflector, mockRequest, executionContext };
}

describe('RolesGuard', () => {
  it('should allow access when no roles are required', () => {
    const { guard, executionContext } = createMockContext();
    expect(guard.canActivate(executionContext)).toBe(true);
  });

  it('should allow access when user has the required role', () => {
    const { guard, executionContext } = createMockContext(
      [UserRole.ADMIN],
      'ADMIN',
    );
    expect(guard.canActivate(executionContext)).toBe(true);
  });

  it('should deny access when user does not have the required role', () => {
    const { guard, executionContext } = createMockContext(
      [UserRole.ADMIN],
      'STUDENT',
    );
    expect(() => guard.canActivate(executionContext)).toThrow(ForbiddenException);
  });

  it('should allow access when user has one of the required roles', () => {
    const { guard, executionContext } = createMockContext(
      [UserRole.PROFESSOR, UserRole.ADMIN],
      'PROFESSOR',
    );
    expect(guard.canActivate(executionContext)).toBe(true);
  });

  it('should deny access when user is not authenticated', () => {
    const { guard, executionContext } = createMockContext(
      [UserRole.STUDENT],
      undefined,
    );
    expect(() => guard.canActivate(executionContext)).toThrow(ForbiddenException);
  });
});
