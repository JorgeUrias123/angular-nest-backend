import { Module } from '@nestjs/common';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Notice, noticeSchema } from './entities/notice.entity';

@Module({
  controllers: [NoticeController],
  providers: [NoticeService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Notice.name,
        schema: noticeSchema
      }
    ]),
  ]
})
export class NoticeModule {}
