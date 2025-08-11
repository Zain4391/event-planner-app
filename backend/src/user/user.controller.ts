import { Controller, Get, Body, Patch, Param, Delete, HttpStatus, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UuidValidationPipe } from 'src/common/pipes/uuid-validation-pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RoleGuard } from 'src/auth/guards/role-guard';
import { Roles } from 'src/auth/decorators/role';
import { UserRole } from 'src/auth/dto/register.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.userService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: "Users retrieved successfully",
      data: users
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', UuidValidationPipe) id: string) {
    const user = await this.userService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "User fetched successfully",
      data: user
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id', UuidValidationPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: "User updated",
      data: user
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id', UuidValidationPipe) id: string) {
    const msg = await this.userService.remove(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: msg
    };
  }

  @Delete('deactivate/:id')
  @UseGuards(JwtAuthGuard)
  async deactivate(@Param('id', UuidValidationPipe) id: string) {
    const msg = await this.userService.deactivate(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: msg
    };
  }
}
