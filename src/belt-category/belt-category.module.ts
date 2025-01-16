import { Module } from '@nestjs/common';
import { BeltCategoryService } from './belt-category.service';
import { BeltCategoryController } from './belt-category.controller';
import { BeltCategory, BeltCategorySchema } from './entities/belt-category.entity';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  controllers: [BeltCategoryController],
  providers: [BeltCategoryService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: BeltCategory.name,
        schema: BeltCategorySchema
      }
    ]),
  ]
})
export class BeltCategoryModule {}
