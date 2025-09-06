import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, Reflector } from '@nestjs/core';
import { RoleGuard } from './role-guard';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RoleGuard>(RoleGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let mockExecutionContext: ExecutionContext;
    let mockRequest: any;

    beforeEach(() => {
      mockRequest = {
        user: {
          id: 'user-id',
          email: 'test@example.com',
          role: 'Admin',
        },
      };

      mockExecutionContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as any;
    });

    it('should return true when no roles are required', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(undefined);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(reflector.get).toHaveBeenCalledWith('roles', mockExecutionContext.getHandler());
    });

    it('should return true when required roles array is empty', () => {
      jest.spyOn(reflector, 'get').mockReturnValue([]);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return true when user has required role', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['Admin', 'Organizer']);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });

    it('should return false when user does not have required role', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['Organizer', 'Customer']);
      mockRequest.user.role = 'Admin';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user is not present', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['Admin']);
      mockRequest.user = null;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should return false when user is undefined', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['Admin']);
      delete mockRequest.user;

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should handle case-sensitive role matching', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
      mockRequest.user.role = 'Admin';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(false);
    });

    it('should work with single role requirement', () => {
      jest.spyOn(reflector, 'get').mockReturnValue(['Customer']);
      mockRequest.user.role = 'Customer';

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
    });
  });
});
