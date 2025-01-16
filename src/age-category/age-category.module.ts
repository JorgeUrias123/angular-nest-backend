import { Module } from '@nestjs/common';
import { AgeCategoryService } from './age-category.service';
import { AgeCategoryController } from './age-category.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AgeCategory, AgeCategorySchema } from './entities/age-category.entity';

@Module({
  controllers: [AgeCategoryController],
  providers: [AgeCategoryService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: AgeCategory.name,
        schema: AgeCategorySchema
      }
    ]),
  ]
})
export class AgeCategoryModule {}
