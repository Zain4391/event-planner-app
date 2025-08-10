import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import * as schema from "../database/schemas/schema";
import type { DatabaseType } from "../database/database.module";
import { categoryReturn } from './types/category-return';
import { eq } from 'drizzle-orm';

@Injectable()
export class CategoriesService {

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: DatabaseType
  ) {}
  async create(createCategoryDto: CreateCategoryDto): Promise<categoryReturn> {
    try {
      const [category] = await this.db.insert(schema.categories).values(createCategoryDto).returning();
      return category;
    } catch (error) {
      if(error.code === "23505") {
        throw new ConflictException("Category already exists");
      }
      throw error;
    }
  }

  async findAll(): Promise<categoryReturn[]> {
    return await this.db.select().from(schema.categories);
  }

  async findOne(id: string): Promise<categoryReturn> {
    try {
      const category = await this.db.select().from(schema.categories).where(eq(schema.categories.id, id));

      if(category.length === 0 || !category) {
        throw new NotFoundException("No categories found");
      }

      return category[0];
    } catch (error) {
      throw error;
    };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<categoryReturn> {
    try {
      const [updateCat] = await this.db.update(schema.categories).set(updateCategoryDto).where(eq(schema.categories.id, id)).returning();

      if(!updateCat) {
        throw new NotFoundException("Category not found");
      }

      return updateCat;
    } catch (error) {
      if (error.code === "23505") {
        throw new ConflictException("Category name already exists");
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const [existing] = await this.db.select().from(schema.categories).where(eq(schema.categories.id, id));
      if(!existing) {
        throw new NotFoundException("Category not found");
      }

      await this.db.delete(schema.categories).where(eq(schema.categories.id, id));
      return `Category number ${id} removed`;
    } catch (error) {
      throw error;
    }
  }
}
