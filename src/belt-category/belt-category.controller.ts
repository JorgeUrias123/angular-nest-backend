import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BeltCategoryService } from './belt-category.service';
import { CreateBeltCategoryDto } from './dto/create-belt-category.dto';
import { UpdateBeltCategoryDto } from './dto/update-belt-category.dto';

@Controller('belt-category')
export class BeltCategoryController {
  constructor(private readonly beltCategoryService: BeltCategoryService) {}

  @Post()
  create(@Body() createBeltCategoryDto: CreateBeltCategoryDto) {
    return this.beltCategoryService.create(createBeltCategoryDto);
  }

  @Get()
  findAll() {
    return this.beltCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beltCategoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBeltCategoryDto: UpdateBeltCategoryDto) {
    return this.beltCategoryService.update(+id, updateBeltCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beltCategoryService.remove(+id);
  }
}
