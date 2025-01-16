import { IsArray, IsEnum, IsString } from "class-validator";
import { Belt } from "src/auth/entities/user.entity";

export class CreateBeltCategoryDto {

  @IsString()
  name: string;

  @IsArray()
  @IsEnum(Belt, { each: true })
  belts: Belt[];
}
