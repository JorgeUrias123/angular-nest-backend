import { Injectable } from '@nestjs/common';
import { CreateBeltCategoryDto } from './dto/create-belt-category.dto';
import { UpdateBeltCategoryDto } from './dto/update-belt-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BeltCategory } from './entities/belt-category.entity';
import { Model } from 'mongoose';

@Injectable()
export class BeltCategoryService {

  constructor(
    @InjectModel(BeltCategory.name)
    private beltCategoryModel: Model<BeltCategory>
  ) {}

  create(createBeltCategoryDto: CreateBeltCategoryDto): Promise<BeltCategory> {
    const newCategory = new this.beltCategoryModel(createBeltCategoryDto);
    return newCategory.save()
  }

  findAll() {
    return this.beltCategoryModel.find().select('name _id belts');
  }

  findOne(id: string): Promise<BeltCategory> {
    return this.beltCategoryModel.findById(id);
  }

  update(id: number, updateBeltCategoryDto: UpdateBeltCategoryDto) {
    return `This action updates a #${id} beltCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} beltCategory`;
  }
}
