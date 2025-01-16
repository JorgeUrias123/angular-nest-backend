import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

class ContactInfoDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  website?: string;
}

class WeightCategoryDto {
  @IsString()
  @IsNotEmpty()
  weightCategory: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participants?: string[];
}

class AgeCategoryDto {
  @IsString()
  @IsNotEmpty()
  ageCategory: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightCategoryDto)
  weightCategories: WeightCategoryDto[];
}

class BeltCategoryDto {
  @IsString()
  @IsNotEmpty()
  beltCategory: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgeCategoryDto)
  ageCategories: AgeCategoryDto[];
}

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  _userId?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  registrationDeadline: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsObject()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BeltCategoryDto)
  divisions: BeltCategoryDto[];

  @IsOptional()
  @IsNumber()
  participantsCount?: number;

  @IsObject()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  judges?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referees?: string[];

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
