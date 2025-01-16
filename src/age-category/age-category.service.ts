import { Injectable } from '@nestjs/common';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AgeCategory } from './entities/age-category.entity';
import { Model } from 'mongoose';

@Injectable()
export class AgeCategoryService {

  constructor(
    @InjectModel(AgeCategory.name)
    private ageCategoryModel: Model<AgeCategory>
  ) {}

  create(createAgeCategoryDto: CreateAgeCategoryDto): Promise<AgeCategory> {
    const newCategory = new this.ageCategoryModel(createAgeCategoryDto);
    return newCategory.save();
  }

  findAll(): Promise<AgeCategory[]> {
    return this.ageCategoryModel.find().select('name _id min max');
  }

  findOne(id: string): Promise<AgeCategory> {
    return this.ageCategoryModel.findById(id);
  }

  update(id: number, updateAgeCategoryDto: UpdateAgeCategoryDto) {
    return `This action updates a #${id} ageCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} ageCategory`;
  }
}
