import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateNoticeDto {
  
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsString()
  text: string;

  @IsDateString()
  @IsOptional()
  date?: Date;
  
}
