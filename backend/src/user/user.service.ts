import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import * as schema from "../database/schemas/schema";
import type { DatabaseType } from "../database/database.module";
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {

  constructor (
    @Inject("DATABASE_CONNECTION") private readonly db: DatabaseType
  ) {}
  
  async findAll() {
    try {
      const users = await this.db.select().from(schema.users);

      if(users.length === 0) {
        return [];
      }
      return users;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const [user] = await this.db.select().from(schema.users).where(eq(schema.users.id, id));
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
        email: schema.users.email
      });

      if(!user) {
        throw new NotFoundException("User not found");
      }

      return user;
    } catch (error) {
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
      });

      return `User # ${id} deactivated`;
    } catch (error) {
      throw error;
    }
  }
}
