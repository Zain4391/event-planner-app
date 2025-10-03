import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, UserRole } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CurrentUser } from './decorators/getCurrentUser';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import type { userReturn } from './types/user.type';
import { RoleGuard } from './guards/role-guard';
import { Roles } from './decorators/role';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // maps to http://localhost:3000/auth/register
  async register(@Body() registerDto: RegisterDto) {
    const response = await this.authService.register(registerDto);

    if ('statusCode' in response) {
      throw new HttpException(response.message, response.statusCode);
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registerd successfully',
      data: response,
    };
  }

  @Post('login') // maps to http://localhost:3000/auth/login
  async login(@Body() loginDto: LoginDto) {
    const response = await this.authService.login(loginDto);

    if ('statusCode' in response) {
      throw new HttpException(response.message, response.statusCode);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'User loggedIn successfully',
      data: response,
    };
  }

  @Post('reset-password') // maps to http://localhost:3000/auth/reset-password
  async resetPassword(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'All fields required',
      };
    }

    const response = await this.authService.resetPassword(
      body.email,
      body.password,
    );

    if (response.statusCode !== 200) {
      throw new HttpException(response.message, response.statusCode);
    }

    return {
      statusCode: response.statusCode,
      message: response.message,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile(@CurrentUser() user: userReturn) {
    return {
      statusCode: HttpStatus.OK,
      message: 'Profile retrieved sucessfully',
      user,
    };
  }

  // test endpoints for RBAC
  @Get('admin-test')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN)
  async adminTest(@CurrentUser() user: userReturn) {
    return {
      message: 'Access Granted to Admin',
      role: user.role,
    };
  }

  @Get('Organizer-test')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async OrganizerTest(@CurrentUser() user: userReturn) {
    return {
      message: 'Access Granted to Admin & Organizer',
      role: user.role,
    };
  }

  @Get('Customer-test')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles(UserRole.CUSTOMER)
  async Customer(@CurrentUser() user: userReturn) {
    return {
      message: 'Access Granted to Customer',
      role: user.role,
    };
  }
}
