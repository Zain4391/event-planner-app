import { IsNotEmpty, IsString, Length } from "class-validator";

export class UpdateCategoryDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 100)
    name?: string;

    @IsString()
    @IsNotEmpty()
    description?: string;
};