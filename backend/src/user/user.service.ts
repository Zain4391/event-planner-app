import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import * as schema from "../database/schemas/schema";
import type { DatabaseType } from "../database/database.module";
import { eq, ilike, or } from 'drizzle-orm';
import { PaginationDto } from './dto/pagination-user-dto';
import { count } from 'drizzle-orm';

@Injectable()
export class UserService {

  constructor (
    @Inject("DATABASE_CONNECTION") private readonly db: DatabaseType
  ) {}
  
  async findAll(paginationDto: PaginationDto) {
    try {
      const users = await this.db.select({
        id: schema.users.id,
        email: schema.users.email,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        createdAt: schema.users.createdAt,
        isActive: schema.users.isActive
      }).from(schema.users)
      .where(
        paginationDto.search 
          ? or(
              ilike(schema.users.firstName, `%${paginationDto.search}%`),
              ilike(schema.users.lastName, `%${paginationDto.search}%`),
              ilike(schema.users.email, `%${paginationDto.search}%`)
            )
          : undefined  // No filter if no search term
      )
      .limit(paginationDto.limit)
      .offset(paginationDto.offset);

      const [totalCountQuery] = await this.db.select({ count: count() })
      .from(schema.users)
      .where(
          paginationDto.search 
            ? or(
                ilike(schema.users.firstName, `%${paginationDto.search}%`),
                ilike(schema.users.lastName, `%${paginationDto.search}%`),
                ilike(schema.users.email, `%${paginationDto.search}%`)
              )
            : undefined
      );
      
      return {
        users,
        meta: {
          page: paginationDto.page,
          limit: paginationDto.limit,
          total: totalCountQuery.count,
          totalPages: Math.ceil(totalCountQuery.count / paginationDto.limit),
          hasNextPage: paginationDto.page < Math.ceil(totalCountQuery.count / paginationDto.limit),
          hasPreviousPage: paginationDto.page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const [user] = await this.db.select({
        id: schema.users.id,
        email: schema.users.email,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        createdAt: schema.users.createdAt,
        isActive: schema.users.isActive
      }).from(schema.users).where(eq(schema.users.id, id));
      if(!user) {
        throw new NotFoundException("User not found");
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const [user] = await this.db.update(schema.users).set(updateUserDto).where(eq(schema.users.id, id)).returning({
        firstname: schema.users.firstName,
        lastName: schema.users.lastName,
        email: schema.users.email,
        isActive: schema.users.isActive
      });

      if(!user) {
        throw new NotFoundException("User not found");
      }

      return user;
    } catch (error) {
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
      if(!user) {
        throw new NotFoundException("User not found");
      }

      await this.db.delete(schema.users).where(eq(schema.users.id, id));
      return `User with id ${id} has been removed PERMANENTLY`;
    } catch (error) {
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
      if(!user) {
        throw new NotFoundException("User not found");
      }

      await this.db.update(schema.users).set({
        isActive: false
      }).where(eq(schema.users.id, id));

      return `User # ${id} deactivated`;
    } catch (error) {
      throw error;
    }
  }
}
