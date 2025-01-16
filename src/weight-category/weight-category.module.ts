import { Module } from '@nestjs/common';
import { WeightCategoryService } from './weight-category.service';
import { WeightCategoryController } from './weight-category.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WeightCategory, WeightCategorySchema } from './entities/weight-category.entity';

@Module({
  controllers: [WeightCategoryController],
  providers: [WeightCategoryService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: WeightCategory.name,
        schema: WeightCategorySchema
      }
    ]),
  ]
})
export class WeightCategoryModule {}
