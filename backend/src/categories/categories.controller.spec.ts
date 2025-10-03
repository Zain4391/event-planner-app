import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { categoryReturn } from './types/category-return';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    categoriesService = module.get<CategoriesService>(CategoriesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      mockCategoriesService.findAll.mockResolvedValueOnce(mockCategories);

      const result = await controller.findAll();

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Categories retrieved successfully',
        data: mockCategories,
      });
      expect(categoriesService.findAll).toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockCategoriesService.findAll.mockRejectedValueOnce(error);

      await expect(controller.findAll()).rejects.toThrow(error);
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
      mockCategoriesService.findOne.mockResolvedValueOnce(mockCategory);

      const result = await controller.findOne(categoryId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Category fetched successfully',
        data: mockCategory,
      });
      expect(categoriesService.findOne).toHaveBeenCalledWith(categoryId);
    });

    it('should handle service errors', async () => {
      const error = new Error('Category not found');
      mockCategoriesService.findOne.mockRejectedValueOnce(error);

      await expect(controller.findOne(categoryId)).rejects.toThrow(error);
    });
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
      mockCategoriesService.create.mockResolvedValueOnce(mockCategory);

      const result = await controller.create(mockCreateCategoryDto);

      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Category created successfully',
        data: mockCategory,
      });
      expect(categoriesService.create).toHaveBeenCalledWith(
        mockCreateCategoryDto,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Category already exists');
      mockCategoriesService.create.mockRejectedValueOnce(error);

      await expect(controller.create(mockCreateCategoryDto)).rejects.toThrow(
        error,
      );
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
      mockCategoriesService.update.mockResolvedValueOnce(mockUpdatedCategory);

      const result = await controller.update(categoryId, updateCategoryDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Category updated successfully',
        data: mockUpdatedCategory,
      });
      expect(categoriesService.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Category not found');
      mockCategoriesService.update.mockRejectedValueOnce(error);

      await expect(
        controller.update(categoryId, updateCategoryDto),
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const categoryId = 'category-id';
    const mockMessage = 'Category number category-id removed';

    it('should remove a category successfully', async () => {
      mockCategoriesService.remove.mockResolvedValueOnce(mockMessage);

      const result = await controller.remove(categoryId);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Category deleted succesfully',
        data: mockMessage,
      });
      expect(categoriesService.remove).toHaveBeenCalledWith(categoryId);
    });

    it('should handle service errors', async () => {
      const error = new Error('Category not found');
      mockCategoriesService.remove.mockRejectedValueOnce(error);

      await expect(controller.remove(categoryId)).rejects.toThrow(error);
    });
  });
});
