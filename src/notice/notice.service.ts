import { Injectable } from '@nestjs/common';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notice } from './entities/notice.entity';
import { Model } from 'mongoose';

@Injectable()
export class NoticeService {

  constructor(
    @InjectModel(Notice.name)
    private readonly noticeModel: Model<Notice>
  ) {}

  async create(createNoticeDto: CreateNoticeDto, filePath: string) {
    const { image, ...data } = createNoticeDto;
    const notice = new this.noticeModel({
      ...data,
      image: filePath,
      imageUrl: `${process.env.MONGO_URI}${filePath}`
    });

    return await notice.save();
  }

  findAll(): Promise<Notice[]> {
    return this.noticeModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} notice`;
  }

  update(id: number, updateNoticeDto: UpdateNoticeDto) {
    return `This action updates a #${id} notice`;
  }

  remove(id: number) {
    return `This action removes a #${id} notice`;
  }
}
