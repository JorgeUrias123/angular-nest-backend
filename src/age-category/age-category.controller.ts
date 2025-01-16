import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgeCategoryService } from './age-category.service';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';

@Controller('age-category')
export class AgeCategoryController {
  constructor(private readonly ageCategoryService: AgeCategoryService) {}

  @Post()
  create(@Body() createAgeCategoryDto: CreateAgeCategoryDto) {
    return this.ageCategoryService.create(createAgeCategoryDto);
  }

  @Get()
  findAll() {
    return this.ageCategoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ageCategoryService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgeCategoryDto: UpdateAgeCategoryDto) {
    return this.ageCategoryService.update(+id, updateAgeCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ageCategoryService.remove(+id);
  }
}
