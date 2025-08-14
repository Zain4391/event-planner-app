import { Type } from "class-transformer";
import { IsPositive, IsOptional, Min, Max, IsString } from "class-validator";

export class PaginationDto {

    /* Query Params come as string so they need to be transformed */
    @IsOptional()
    @Type(() => Number)
    @IsPositive({message: "Page must be a positive number"})
    @Min(1, { message: "Page must be at least 1"})
    page: number = 1;

    /* Query Params come as string so they need to be transformed */
    @IsOptional()
    @Type(() => Number)
    @IsPositive({ message: 'Limit must be a positive number' })
    @Min(1, { message: 'Limit must be at least 1' })
    @Max(100, { message: 'Limit cannot exceed 100' })
    limit: number = 10;

    @IsOptional()
    @IsString()
    search?: string;

    get offset() {
        return (this.page - 1) * this.limit;
    }

};