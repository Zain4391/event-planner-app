import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { userReturn } from './types/user.type';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    const mockUser: userReturn = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Customer',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    it('should successfully register a user', async () => {
      mockAuthService.register.mockResolvedValueOnce(mockUser);

      const result = await controller.register(mockRegisterDto);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'User registerd successfully',
        data: mockUser,
      });
      expect(authService.register).toHaveBeenCalledWith(mockRegisterDto);
    });

    it('should throw HttpException when registration fails', async () => {
      const errorResponse = {
        statusCode: 400,
        message: 'Email already in use',
      };
      mockAuthService.register.mockResolvedValueOnce(errorResponse);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        new HttpException('Email already in use', 400),
      );
    });

    it('should handle service errors', async () => {
      const errorResponse = {
        statusCode: 500,
        message: 'Internal server error',
      };
      mockAuthService.register.mockResolvedValueOnce(errorResponse);

      await expect(controller.register(mockRegisterDto)).rejects.toThrow(
        new HttpException('Internal server error', 500),
      );
    });
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockLoginResponse = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Customer',
      token: 'mock-jwt-token',
    };

    it('should successfully login a user', async () => {
      mockAuthService.login.mockResolvedValueOnce(mockLoginResponse);

      const result = await controller.login(mockLoginDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'User loggedIn successfully',
        data: mockLoginResponse,
      });
      expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    });

    it('should throw HttpException when login fails', async () => {
      const errorResponse = {
        statusCode: 401,
        message: 'Invalid credentials',
      };
      mockAuthService.login.mockResolvedValueOnce(errorResponse);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        new HttpException('Invalid credentials', 401),
      );
    });

    it('should handle service errors', async () => {
      const errorResponse = {
        statusCode: 500,
        message: 'Internal server error',
      };
      mockAuthService.login.mockResolvedValueOnce(errorResponse);

      await expect(controller.login(mockLoginDto)).rejects.toThrow(
        new HttpException('Internal server error', 500),
      );
    });
  });

  describe('resetPassword', () => {
    const resetPasswordBody = {
      email: 'test@example.com',
      password: 'newpassword123',
    };

    it('should successfully reset password', async () => {
      const successResponse = {
        statusCode: 200,
        message: 'Password updated successfully',
      };
      mockAuthService.resetPassword.mockResolvedValueOnce(successResponse);

      const result = await controller.resetPassword(resetPasswordBody);

      expect(result).toEqual(successResponse);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordBody.email,
        resetPasswordBody.password,
      );
    });

    it('should return bad request when fields are missing', async () => {
      const incompleteBody = { email: 'test@example.com', password: '' };

      const result = await controller.resetPassword(incompleteBody);

      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'All fields required',
      });
    });

    it('should throw HttpException when reset fails', async () => {
      const errorResponse = {
        statusCode: 404,
        message: 'User not found',
      };
      mockAuthService.resetPassword.mockResolvedValueOnce(errorResponse);

      await expect(controller.resetPassword(resetPasswordBody)).rejects.toThrow(
        new HttpException('User not found', 404),
      );
    });
  });

  describe('getUserProfile', () => {
    const mockUser: userReturn = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Customer',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    it('should return user profile', async () => {
      const result = await controller.getUserProfile(mockUser);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Profile retrieved sucessfully',
        user: mockUser,
      });
    });
  });

  describe('role-based endpoints', () => {
    const mockUser: userReturn = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Admin',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    it('should allow admin access to admin-test endpoint', async () => {
      const result = await controller.adminTest(mockUser);

      expect(result).toEqual({
        message: 'Access Granted to Admin',
        role: 'Admin',
      });
    });

    it('should allow admin and organizer access to organizer-test endpoint', async () => {
      const result = await controller.OrganizerTest(mockUser);

      expect(result).toEqual({
        message: 'Access Granted to Admin & Organizer',
        role: 'Admin',
      });
    });

    it('should allow customer access to customer-test endpoint', async () => {
      const customerUser = { ...mockUser, role: 'Customer' };
      const result = await controller.Customer(customerUser);

      expect(result).toEqual({
        message: 'Access Granted to Customer',
        role: 'Customer',
      });
    });
  });
});
