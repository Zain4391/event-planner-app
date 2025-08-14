import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Length, Min, IsUrl } from "class-validator";

export class CreateEventDto {
    @IsString()
    @Length(1, 255)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsUUID()
    categoryId: string;

    @IsString()
    @Length(1, 255)
    venueName: string;

    @IsString()
    venueAddress: string;

    @IsDateString()
    eventDate: string;  // "2024-12-25"

    @IsString()
    startTime: string;  // "14:30:00"

    @IsString()
    endTime: string;    // "18:00:00"

    @IsInt()
    @Min(1)
    totalCapacity: number;

    @IsOptional()
    @IsUrl()
    bannerImageUrl?: string;
}