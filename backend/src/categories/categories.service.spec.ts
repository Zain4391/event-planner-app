import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categoryReturn } from './types/category-return';

// Mock the database schema
const mockDb = {
  insert: jest.fn().mockReturnThis(),
  values: jest.fn().mockReturnThis(),
  returning: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  set: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
};

const mockSchema = {
  categories: {
    id: 'id',
    name: 'name',
    description: 'description',
    createdAt: 'createdAt',
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockCreateCategoryDto: CreateCategoryDto = {
      name: 'Technology',
      description: 'Tech related events',
    };

    const mockCategory: categoryReturn = {
      id: 'category-id',
      name: 'Technology',
      description: 'Tech related events',
      createdAt: '2023-01-01T00:00:00Z',
    };

    it('should create a category successfully', async () => {
      mockDb.insert.mockResolvedValueOnce([mockCategory]);

      const result = await service.create(mockCreateCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(mockDb.insert).toHaveBeenCalledWith(mockSchema.categories);
      expect(mockDb.values).toHaveBeenCalledWith(mockCreateCategoryDto);
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should throw ConflictException when category already exists', async () => {
      const error = new Error('Unique constraint violation');
      error.code = '23505';
      mockDb.insert.mockRejectedValueOnce(error);

      await expect(service.create(mockCreateCategoryDto)).rejects.toThrow(
        new ConflictException('Category already exists'),
      );
    });

    it('should handle other errors', async () => {
      const error = new Error('Database error');
      mockDb.insert.mockRejectedValueOnce(error);

      await expect(service.create(mockCreateCategoryDto)).rejects.toThrow(
        error,
      );
    });
  });

  describe('findAll', () => {
    const mockCategories: categoryReturn[] = [
      {
        id: 'category-1',
        name: 'Technology',
        description: 'Tech related events',
        createdAt: '2023-01-01T00:00:00Z',
      },
      {
        id: 'category-2',
        name: 'Music',
        description: 'Music events',
        createdAt: '2023-01-02T00:00:00Z',
      },
    ];

    it('should return all categories', async () => {
      mockDb.select.mockResolvedValueOnce(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockDb.select).toHaveBeenCalledWith().from(mockSchema.categories);
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.findAll()).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    const categoryId = 'category-id';
    const mockCategory: categoryReturn = {
      id: categoryId,
      name: 'Technology',
      description: 'Tech related events',
      createdAt: '2023-01-01T00:00:00Z',
    };

    it('should return a category by id', async () => {
      mockDb.select.mockResolvedValueOnce([mockCategory]);

      const result = await service.findOne(categoryId);

      expect(result).toEqual(mockCategory);
      expect(mockDb.select)
        .toHaveBeenCalledWith()
        .from(mockSchema.categories)
        .where(expect.any(Function));
    });

    it('should throw NotFoundException when category not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.findOne(categoryId)).rejects.toThrow(
        new NotFoundException('No categories found'),
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.findOne(categoryId)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    const categoryId = 'category-id';
    const updateCategoryDto: UpdateCategoryDto = {
      name: 'Updated Technology',
      description: 'Updated tech events',
    };

    const mockUpdatedCategory: categoryReturn = {
      id: categoryId,
      name: 'Updated Technology',
      description: 'Updated tech events',
      createdAt: '2023-01-01T00:00:00Z',
    };

    it('should update a category successfully', async () => {
      mockDb.update.mockResolvedValueOnce([mockUpdatedCategory]);

      const result = await service.update(categoryId, updateCategoryDto);

      expect(result).toEqual(mockUpdatedCategory);
      expect(mockDb.update).toHaveBeenCalledWith(mockSchema.categories);
      expect(mockDb.set).toHaveBeenCalledWith(updateCategoryDto);
      expect(mockDb.where).toHaveBeenCalledWith(expect.any(Function));
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should throw NotFoundException when category not found', async () => {
      mockDb.update.mockResolvedValueOnce([]);

      await expect(
        service.update(categoryId, updateCategoryDto),
      ).rejects.toThrow(new NotFoundException('Category not found'));
    });

    it('should throw ConflictException when category name already exists', async () => {
      const error = new Error('Unique constraint violation');
      error.code = '23505';
      mockDb.update.mockRejectedValueOnce(error);

      await expect(
        service.update(categoryId, updateCategoryDto),
      ).rejects.toThrow(new ConflictException('Category name already exists'));
    });

    it('should handle other errors', async () => {
      const error = new Error('Database error');
      mockDb.update.mockRejectedValueOnce(error);

      await expect(
        service.update(categoryId, updateCategoryDto),
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const categoryId = 'category-id';
    const mockCategory = { id: categoryId };

    it('should remove a category successfully', async () => {
      mockDb.select.mockResolvedValueOnce([mockCategory]);
      mockDb.delete.mockResolvedValueOnce(undefined);

      const result = await service.remove(categoryId);

      expect(result).toBe(`Category number ${categoryId} removed`);
      expect(mockDb.select)
        .toHaveBeenCalledWith()
        .from(mockSchema.categories)
        .where(expect.any(Function));
      expect(mockDb.delete)
        .toHaveBeenCalledWith(mockSchema.categories)
        .where(expect.any(Function));
    });

    it('should throw NotFoundException when category not found', async () => {
      mockDb.select.mockResolvedValueOnce([]);

      await expect(service.remove(categoryId)).rejects.toThrow(
        new NotFoundException('Category not found'),
      );
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockDb.select.mockRejectedValueOnce(error);

      await expect(service.remove(categoryId)).rejects.toThrow(error);
    });
  });
});
