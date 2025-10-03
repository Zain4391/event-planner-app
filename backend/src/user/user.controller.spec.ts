import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination-user-dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    const mockPaginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      search: 'test',
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
    ];

    const mockResult = {
      users: mockUsers,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };

    it('should return paginated users', async () => {
      mockUserService.findAll.mockResolvedValueOnce(mockResult);

      const result = await controller.findAll(mockPaginationDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Users retrieved successfully',
        data: mockUsers,
        pagination: mockResult.meta,
      });
      expect(userService.findAll).toHaveBeenCalledWith(mockPaginationDto);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockUserService.findAll.mockRejectedValueOnce(error);

      await expect(controller.findAll(mockPaginationDto)).rejects.toThrow(
        error,
      );
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
      mockUserService.findOne.mockResolvedValueOnce(mockUser);

      const result = await controller.findOne(userId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'User fetched successfully',
        data: mockUser,
      });
      expect(userService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors', async () => {
      const error = new Error('User not found');
      mockUserService.findOne.mockRejectedValueOnce(error);

      await expect(controller.findOne(userId)).rejects.toThrow(error);
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
      mockUserService.update.mockResolvedValueOnce(mockUpdatedUser);

      const result = await controller.update(userId, updateUserDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'User updated',
        data: mockUpdatedUser,
      });
      expect(userService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should handle service errors', async () => {
      const error = new Error('Update failed');
      mockUserService.update.mockRejectedValueOnce(error);

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('remove', () => {
    const userId = 'user-id';
    const mockMessage = 'User with id user-id has been removed PERMANENTLY';

    it('should remove a user successfully', async () => {
      mockUserService.remove.mockResolvedValueOnce(mockMessage);

      const result = await controller.remove(userId);

      expect(result).toEqual({
        statusCode: HttpStatus.NO_CONTENT,
        message: mockMessage,
      });
      expect(userService.remove).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors', async () => {
      const error = new Error('Delete failed');
      mockUserService.remove.mockRejectedValueOnce(error);

      await expect(controller.remove(userId)).rejects.toThrow(error);
    });
  });

  describe('deactivate', () => {
    const userId = 'user-id';
    const mockMessage = 'User # user-id deactivated';

    it('should deactivate a user successfully', async () => {
      mockUserService.deactivate.mockResolvedValueOnce(mockMessage);

      const result = await controller.deactivate(userId);

      expect(result).toEqual({
        statusCode: HttpStatus.NO_CONTENT,
        message: mockMessage,
      });
      expect(userService.deactivate).toHaveBeenCalledWith(userId);
    });

    it('should handle service errors', async () => {
      const error = new Error('Deactivation failed');
      mockUserService.deactivate.mockRejectedValueOnce(error);

      await expect(controller.deactivate(userId)).rejects.toThrow(error);
    });
  });
});
