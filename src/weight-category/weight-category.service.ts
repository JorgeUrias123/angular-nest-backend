import { Injectable } from '@nestjs/common';
import { CreateWeightCategoryDto } from './dto/create-weight-category.dto';
import { UpdateWeightCategoryDto } from './dto/update-weight-category.dto';
import { Model } from 'mongoose';
import { WeightCategory } from './entities/weight-category.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WeightCategoryService {

  constructor(
    @InjectModel(WeightCategory.name)
    private weightCategoryModel: Model<WeightCategory>
  ) {}

  create(createWeightCategoryDto: CreateWeightCategoryDto): Promise<WeightCategory> {
    const newCategory = new this.weightCategoryModel(createWeightCategoryDto);
    return newCategory.save()
  }

  findAll() {
    return `This action returns all weightCategory`;
  }

  findByIdAgeCategory(idAgeCategory: string): Promise<WeightCategory[]> {
    return this.weightCategoryModel.find({ _idAgeCategory: idAgeCategory }).select('name _id _idAgeCategory wMin wMax');
  }

  findOne(id: string): Promise<WeightCategory> {
    return this.weightCategoryModel.findById(id);
  }

  update(id: number, updateWeightCategoryDto: UpdateWeightCategoryDto) {
    return `This action updates a #${id} weightCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} weightCategory`;
  }
}
