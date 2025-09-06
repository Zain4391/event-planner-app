import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination-user-dto';

// Mock the database schema
const mockDb = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  offset: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

const mockSchema = {
  users: {
    id: 'id',
    email: 'email',
    firstName: 'firstName',
    lastName: 'lastName',
    createdAt: 'createdAt',
    isActive: 'isActive',
  },
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const mockPaginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      search: 'test',
      offset: 0,
    };

    const mockUsers = [
      {
        id: 'user-1',
        email: 'test1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: '2023-01-01T00:00:00Z',
        isActive: true,
      },
      {
        id: 'user-2',
        email: 'test2@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        createdAt: '2023-01-02T00:00:00Z',
        isActive: true,
      },
    ];

    const mockCountResult = { count: 2 };

    it('should return paginated users with search', async () => {
      mockDb.select.mockResolvedValueOnce(mockUsers);
      mockDb.select.mockResolvedValueOnce([mockCountResult]);

      const result = await service.findAll(mockPaginationDto);

      expect(result).toEqual({
        users: mockUsers,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      expect(mockDb.select).toHaveBeenCalledTimes(2);
      expect(mockDb.limit).toHaveBeenCalledWith(10);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
    });

    it('should return paginated users without search', async () => {
      const paginationWithoutSearch = { ...mockPaginationDto, search: undefined, offset: 0 };
      mockDb.select.mockResolvedValueOnce(mockUsers);
      mockDb.select.mockResolvedValueOnce([mockCountResult]);

      const result = await service.findAll(paginationWithoutSearch);

      expect(result).toEqual({
        users: mockUsers,
        meta: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.findAll(mockPaginationDto)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    const userId = 'user-id';
    const mockUser = {
      id: userId,
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      createdAt: '2023-01-01T00:00:00Z',
      isActive: true,
    };

    it('should return a user by id', async () => {
      mockDb.select.mockResolvedValueOnce([mockUser]);

      const result = await service.findOne(userId);

      expect(result).toEqual(mockUser);
      expect(mockDb.select).toHaveBeenCalledWith({
        id: mockSchema.users.id,
        email: mockSchema.users.email,
        firstName: mockSchema.users.firstName,
        lastName: mockSchema.users.lastName,
        createdAt: mockSchema.users.createdAt,
        isActive: mockSchema.users.isActive,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.findOne(userId)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.findOne(userId)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const userId = 'user-id';
    const updateUserDto: UpdateUserDto = {
      firstName: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
    };

    const mockUpdatedUser = {
      firstname: 'Updated',
      lastName: 'Name',
      email: 'updated@example.com',
      isActive: true,
    };

    it('should update a user successfully', async () => {
      mockDb.update.mockResolvedValueOnce([mockUpdatedUser]);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockDb.update).toHaveBeenCalledWith(mockSchema.users);
      expect(mockDb.set).toHaveBeenCalledWith(updateUserDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.update.mockResolvedValueOnce([]);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const error = new Error('Unique constraint violation') as any;
      error.code = '23505';
      mockDb.update.mockRejectedValueOnce(error);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        new ConflictException('Email already exists')
      );
    });

    it('should handle other errors', async () => {
      const error = new Error('Database error');
      mockDb.update.mockRejectedValueOnce(error);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const userId = 'user-id';
    const mockUser = { id: userId };

    it('should remove a user successfully', async () => {
      mockDb.select.mockResolvedValueOnce([mockUser]);
      mockDb.delete.mockResolvedValueOnce(undefined);

      const result = await service.remove(userId);

      expect(result).toBe(`User with id ${userId} has been removed PERMANENTLY`);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockSchema.users);
      expect(mockDb.delete).toHaveBeenCalledWith(mockSchema.users);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.remove(userId)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.remove(userId)).rejects.toThrow(error);
    });
  });

  describe('deactivate', () => {
    const userId = 'user-id';
    const mockUser = { id: userId };

    it('should deactivate a user successfully', async () => {
      mockDb.select.mockResolvedValueOnce([mockUser]);
      mockDb.update.mockResolvedValueOnce(undefined);

      const result = await service.deactivate(userId);

      expect(result).toBe(`User # ${userId} deactivated`);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(mockSchema.users);
      expect(mockDb.update).toHaveBeenCalledWith(mockSchema.users);
      expect(mockDb.set).toHaveBeenCalledWith({ isActive: false });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.deactivate(userId)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.deactivate(userId)).rejects.toThrow(error);
    });
  });
});
