import { IsString, MinLength, MaxLength, IsOptional, IsEmail, IsNotEmpty, Min, IsEnum } from 'class-validator';


export enum UserRole {
    ADMIN = "Admin",
    ORGANIZER = "Organizer", 
    CUSTOMER = "Customer"
}

export class RegisterDto {

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole; // Optional - defaults to Customer
};