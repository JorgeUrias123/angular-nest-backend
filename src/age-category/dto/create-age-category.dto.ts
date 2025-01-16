import { IsInt, IsString } from "class-validator";

export class CreateAgeCategoryDto {

  @IsString()
  name: string;

  @IsInt()
  min: number;

  @IsInt()
  max: number;
}
