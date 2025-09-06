import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

// Mock the database schema
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
};

const mockSchema = {
  users: {
    id: 'id',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    passwordHash: 'passwordHash',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
  },
};

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                BCRYPT_ROUNDS: '12',
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '7d',
              };
              return config[key];
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
      role: UserRole.CUSTOMER,
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Customer',
      isActive: true,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    it('should successfully register a new user', async () => {
      // Mock database responses
      mockDb.select.mockResolvedValueOnce([]); // No existing user
      mockDb.insert.mockResolvedValueOnce([mockUser]);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');

      const result = await service.register(mockRegisterDto);

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockSchema.users);
      expect(mockDb.insert).toHaveBeenCalledWith(mockSchema.users);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should return error when email already exists', async () => {
      mockDb.select.mockResolvedValueOnce([{ id: 'existing-user' }]); // Existing user found

      const result = await service.register(mockRegisterDto);

      expect(result).toEqual({
        statusCode: 400,
        message: 'Email already in use',
      });
    });

    it('should handle registration errors', async () => {
      mockDb.select.mockRejectedValueOnce(new Error('Database error'));

      const result = await service.register(mockRegisterDto);

      expect(result).toEqual({
        statusCode: 500,
        message: expect.any(Error),
      });
    });

    it('should register user with default role when not provided', async () => {
      const dtoWithoutRole = { ...mockRegisterDto };
      delete dtoWithoutRole.role;

      mockDb.select.mockResolvedValueOnce([]);
      mockDb.insert.mockResolvedValueOnce([mockUser]);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce('hashed-password');

      await service.register(dtoWithoutRole);

      expect(mockDb.insert).toHaveBeenCalledWith(mockSchema.users);
    });
  });

  describe('login', () => {
    const mockLoginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      passwordHash: 'hashed-password',
      role: 'Customer',
      isActive: true,
    };

    it('should successfully login with valid credentials', async () => {
      mockDb.select.mockResolvedValueOnce([mockUser]);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      const result = await service.login(mockLoginDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        token: 'mock-jwt-token',
      });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(jwtService.sign).toHaveBeenCalledWith(
        {
          id: mockUser.id,
          email: mockUser.email,
          isActive: mockUser.isActive,
          role: mockUser.role,
        },
        {
          secret: 'test-secret',
          expiresIn: '7d',
        }
      );
    });

    it('should return error when user not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      const result = await service.login(mockLoginDto);

      expect(result).toEqual({
        statusCode: 404,
        message: 'Invalid credentials',
      });
    });

    it('should return error when password is incorrect', async () => {
      mockDb.select.mockResolvedValueOnce([mockUser]);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const result = await service.login(mockLoginDto);

      expect(result).toEqual({
        statusCode: 401,
        message: 'Login Failed, please check your credentials.',
      });
    });

    it('should handle login errors', async () => {
      mockDb.select.mockRejectedValueOnce(new Error('Database error'));

      const result = await service.login(mockLoginDto);

      expect(result).toEqual({
        statusCode: 500,
        message: 'Internal Server error: Error: Database error',
      });
    });
  });

  describe('resetPassword', () => {
    const email = 'test@example.com';
    const newPassword = 'newpassword123';

    it('should successfully reset password', async () => {
      mockDb.select.mockResolvedValueOnce([{ id: 'user-id' }]);
      mockDb.update.mockResolvedValueOnce([{ id: 'user-id' }]);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValueOnce('new-hashed-password');

      const result = await service.resetPassword(email, newPassword);

      expect(result).toEqual({
        statusCode: 200,
        message: 'Password updated successfully',
      });
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
    });

    it('should return error when user not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      const result = await service.resetPassword(email, newPassword);

      expect(result).toEqual({
        statusCode: 404,
        message: 'User not found',
      });
    });

    it('should handle reset password errors', async () => {
      mockDb.select.mockRejectedValueOnce(new Error('Database error'));

      const result = await service.resetPassword(email, newPassword);

      expect(result).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });
    });
  });
});
