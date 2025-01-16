import { IsDecimal, IsInt, IsMongoId, IsNumber, IsString } from "class-validator";


export class CreateWeightCategoryDto {

  @IsMongoId()
  _idAgeCategory: string;

  @IsString()
  name: string;

  @IsNumber()
  wMin: number;

  @IsNumber()
  wMax: number;
}
