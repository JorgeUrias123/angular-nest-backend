import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeightCategoryService } from './weight-category.service';
import { CreateWeightCategoryDto } from './dto/create-weight-category.dto';
import { UpdateWeightCategoryDto } from './dto/update-weight-category.dto';

@Controller('weight-category')
export class WeightCategoryController {
  constructor(private readonly weightCategoryService: WeightCategoryService) {}

  @Post()
  create(@Body() createWeightCategoryDto: CreateWeightCategoryDto) {
    return this.weightCategoryService.create(createWeightCategoryDto);
  }

  @Get()
  findAll() {
    return this.weightCategoryService.findAll();
  }

  @Get(':id')
  findByIdAgeCategory(@Param('id') idAgeCategory: string) {
    return this.weightCategoryService.findByIdAgeCategory(idAgeCategory);
  }

  @Get('/categoryID/:id')
  findOne(@Param('id') id: string) {
    return this.weightCategoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeightCategoryDto: UpdateWeightCategoryDto) {
    return this.weightCategoryService.update(+id, updateWeightCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weightCategoryService.remove(+id);
  }
}
