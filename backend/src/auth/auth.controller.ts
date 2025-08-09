import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register") // maps to http://localhost:3000/auth/register
    async register(@Body() registerDto: RegisterDto) {
        const response = await this.authService.register(registerDto);

        if('statusCode' in response) {
            throw new HttpException(response.message, response.statusCode);
        }

        return {
            statusCode: HttpStatus.CREATED,
            message: "User registerd successfully",
            data: response
        }
    }

    @Post("login") // maps to http://localhost:3000/auth/login
    async login(@Body() loginDto: LoginDto) {
        const response = await this.authService.login(loginDto);

        if('statusCode' in response) {
            throw new HttpException(response.message, response.statusCode);
        }

        return {
            statusCode: HttpStatus.OK,
            message: "User loggedIn successfully",
            data: response
        }
    }

    @Post("reset-password") // maps to http://localhost:3000/auth/reset-password
    async resetPassword(@Body() body: {email: string, password: string}) {
        if(!body.email || !body.password) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: "All fields required",
            }
        }

        const response = await this.authService.resetPassword(body.email, body.password);
        
        if(response.statusCode !== 200) {
            throw new HttpException(response.message, response.statusCode);
        }

        return {
            statusCode: response.statusCode,
            message: response.message
        }
    }
}
