import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Tournament, TournamentSchema } from './entities/tournament.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthService } from 'src/auth/auth.service';
import { User, UserSchema } from 'src/auth/entities/user.entity';
import { BeltCategory, BeltCategorySchema } from 'src/belt-category/entities/belt-category.entity';
import { AgeCategory, AgeCategorySchema } from 'src/age-category/entities/age-category.entity';
import { WeightCategory, WeightCategorySchema } from 'src/weight-category/entities/weight-category.entity';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Tournament.name,
        schema: TournamentSchema
      },
      { 
        name: User.name, 
        schema: UserSchema 
      },
      { 
        name: BeltCategory.name, 
        schema: BeltCategorySchema 
      },
      { 
        name: AgeCategory.name, 
        schema: AgeCategorySchema 
      },
      { 
        name: WeightCategory.name, 
        schema: WeightCategorySchema 
      },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,

  ]

})
export class TournamentModule {}
