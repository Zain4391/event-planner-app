import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as schema from "../database/schemas/schema";
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { loginReturn, userApiResponse, userReturn } from './types/user.type';
import { eq } from 'drizzle-orm';
import type { DatabaseType } from "../database/database.module";
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {

    constructor(
        @Inject("DATABASE_CONNECTION") private db: DatabaseType,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    private async hashPassword(password: string) {
        const salt = parseInt(this.configService.get<string>("BCRYPT_ROUNDS") || "12", 10);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    private async signAndgenerateToken(id: string, email: string, isActive: boolean, role: string) {
        const payload = {id: id, email, isActive, role};
        const jwtSecret = this.configService.get<string>('JWT_SECRET');
        const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '7d';

        // generate token
        const token = this.jwtService.sign(payload, {
            secret: jwtSecret,
            expiresIn: jwtExpiresIn
        });
        return token;
    }

    async register(user: RegisterDto): Promise<userReturn | userApiResponse> {
        try {
            // 1. Check for email
            const userWithMail = await this.db.select().from(schema.users).where(eq(schema.users.email, user.email));
            if(userWithMail.length > 0) {
                return {
                    statusCode: 400,
                    message: "Email already in use"
                };
            }
            // 2. hash the password
            const passHash = await this.hashPassword(user.password);

            // 3. Create the user and save in DB
            const [newUser] = await this.db.insert(schema.users).values({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                passwordHash: passHash,
                ...(user.role && { role: user.role }) // insert provided role or fall back to DB default
            }).returning({
                id: schema.users.id,
                email: schema.users.email,
                firstName: schema.users.firstName,
                lastName: schema.users.lastName,
                role: schema.users.role,
                isActive: schema.users.isActive,
                createdAt: schema.users.createdAt,
                updatedAt: schema.users.updatedAt
            });
            // 4. return the function type
            return newUser;
        } catch (error) {
            console.log("Error registering user", error);
            return {
                statusCode: 500,
                message: error
            };
        }
    }
    
    async login(user: LoginDto): Promise<loginReturn | userApiResponse> {

        try {
            // 1. check email
            const emailUser = await this.db.select().from(schema.users).where(eq(schema.users.email, user.email));
            if(emailUser.length === 0) {
                return {
                    statusCode: 404,
                    message: "Invalid credentials"
                }
            }

            // 2. compare password hash
            const userDB = emailUser[0];
            if(await bcrypt.compare(user.password, userDB.passwordHash)) {
                // 3. sign the token, return the user & token
                const token = await this.signAndgenerateToken(userDB.id, userDB.email, userDB.isActive || false, userDB.role);
                return {
                    id: userDB.id,
                    email: userDB.email,
                    firstName: userDB.firstName,
                    lastName: userDB.lastName,
                    role: userDB.role,
                    token: token
                };
            } else {
                return {
                    statusCode: 401,
                    message: "Login Failed, please check your credentials."
                };
            }
        } catch (error) {
            return {
                statusCode: 500,
                message: `Internal Server error: ${error}`
            };
        }
    }

    async resetPassword(email: string, password: string): Promise<userApiResponse> {
        try {
            // 1. Check for email
            const emailUser = await this.db.select().from(schema.users).where(eq(schema.users.email, email));
            if(emailUser.length === 0) {
                return {
                    statusCode: 404,
                    message: "User not found"
                };
            }
    
            // 2. Hash new password
            const hashpass = await this.hashPassword(password);
    
            // 3. update the database
            await this.db.update(schema.users)
                .set({ 
                    passwordHash: hashpass,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(schema.users.email, email));
    
            return {
                statusCode: 200,
                message: "Password updated successfully"
            };
        } catch (error) {
            console.error("Password reset error:", error);
            return {
                statusCode: 500,
                message: "Internal server error"
            };
        }
    }
}
