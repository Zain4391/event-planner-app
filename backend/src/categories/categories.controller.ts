import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation-pipe';
import { categoryApiResponse } from './types/category-return';
import { Roles } from 'src/auth/decorators/role';
import { UserRole } from 'src/auth/dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RoleGuard } from 'src/auth/guards/role-guard';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async findAll(): Promise<categoryApiResponse> {
    const categories = await this.categoriesService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: "Categories retrieved successfully",
      data: categories
    };
  }

  @Get(':id')
  async findOne(@Param('id', UuidValidationPipe) id: string): Promise<categoryApiResponse> {
    const category = await this.categoriesService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Category fetched successfully",
      data: category
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<categoryApiResponse> {
    const category = await this.categoriesService.create(createCategoryDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Category created successfully",
      data: category
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id', UuidValidationPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto): Promise<categoryApiResponse> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return {
      statusCode: HttpStatus.OK,
      message: "Category updated successfully",
      data: category
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', UuidValidationPipe) id: string): Promise<categoryApiResponse> {
    const response = await this.categoriesService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Category deleted succesfully",
      data: response
    }
  }
}
