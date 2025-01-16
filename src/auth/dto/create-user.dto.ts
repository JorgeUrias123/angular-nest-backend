import { IsEmail, IsEnum, IsInt, IsOptional, IsString, MinLength } from "class-validator";
import { Belt, Gender, Rol } from "../entities/user.entity";

export class CreateUserDto {

  @IsString()
  name: string;

  @IsString()
  lastName1: string;

  @IsString()
  lastName2: string;

  @IsEmail()
  email: string;

  @IsInt()
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsEnum(Belt)
  @IsOptional()
  belt?: Belt;

  @IsEnum(Rol)
  rol: Rol;

  @MinLength(6)
  password: string;
}
