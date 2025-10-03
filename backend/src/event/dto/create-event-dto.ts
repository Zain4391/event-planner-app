import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  IsUrl,
  Matches,
  MinDate,
} from 'class-validator';

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
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date(), {
    message: 'Event date must be in the future.',
  })
  eventDate: string; // "2024-12-25"

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM:SS format',
  })
  startTime: string; // "14:30:00"

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM:SS format',
  })
  endTime: string; // "18:00:00"

  @IsInt()
  @Min(1)
  totalCapacity: number;

  @IsOptional()
  @IsUrl()
  bannerImageUrl?: string;
}
