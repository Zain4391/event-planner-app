import { ExecutionContext } from '@nestjs/common';
import { CurrentUser } from './getCurrentUser';

describe('CurrentUser Decorator', () => {
  let mockExecutionContext: ExecutionContext;
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        role: 'Admin',
        firstName: 'John',
        lastName: 'Doe',
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

  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof CurrentUser).toBe('function');
  });

  describe('when called', () => {
    it('should return the user from request', () => {
      const result = CurrentUser(null, mockExecutionContext);

      expect(result).toEqual(mockRequest.user);
    });

    it('should return undefined when user is not present in request', () => {
      mockRequest.user = undefined;

      const result = CurrentUser(null, mockExecutionContext);

      expect(result).toBeUndefined();
    });

    it('should return null when user is null in request', () => {
      mockRequest.user = null;

      const result = CurrentUser(null, mockExecutionContext);

      expect(result).toBeNull();
    });

    it('should ignore the data parameter', () => {
      const data = { some: 'data' };

      const result = CurrentUser(data, mockExecutionContext);

      expect(result).toEqual(mockRequest.user);
    });

    it('should work with different user structures', () => {
      const customUser = {
        id: 'custom-id',
        username: 'customuser',
        permissions: ['read', 'write'],
      };
      mockRequest.user = customUser;

      const result = CurrentUser(null, mockExecutionContext);

      expect(result).toEqual(customUser);
    });

    it('should call switchToHttp and getRequest', () => {
      const switchToHttpSpy = jest.spyOn(mockExecutionContext, 'switchToHttp');
      const getRequestSpy = jest.spyOn(
        mockExecutionContext.switchToHttp(),
        'getRequest',
      );

      CurrentUser(null, mockExecutionContext);

      expect(switchToHttpSpy).toHaveBeenCalled();
      expect(getRequestSpy).toHaveBeenCalled();
    });
  });
});
