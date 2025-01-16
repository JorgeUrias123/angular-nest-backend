import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TournamentModule } from './tournament/tournament.module';
import { AgeCategoryModule } from './age-category/age-category.module';
import { WeightCategoryModule } from './weight-category/weight-category.module';
import { BeltCategoryModule } from './belt-category/belt-category.module';
import { NoticeModule } from './notice/notice.module';
import { RecoveryModule } from './recovery/recovery.module';


@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME
    }),
    AuthModule,
    TournamentModule,
    AgeCategoryModule,
    WeightCategoryModule,
    BeltCategoryModule,
    NoticeModule,
    RecoveryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
