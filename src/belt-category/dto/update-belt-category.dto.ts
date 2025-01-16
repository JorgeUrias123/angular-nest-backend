import { PartialType } from '@nestjs/mapped-types';
import { CreateBeltCategoryDto } from './create-belt-category.dto';

export class UpdateBeltCategoryDto extends PartialType(CreateBeltCategoryDto) {}
