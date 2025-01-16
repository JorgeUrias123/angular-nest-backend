import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Query, Put } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { MatchStatus, Tournament, TournamentDocument } from './entities/tournament.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileFilter, renameImage } from './helpers/images.helper';
import { AddParticipantDto } from './dto/add-participant.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateMatchScoreDto } from './dto/update-match-score.dto';

@Controller('tournament')
export class TournamentController {
  constructor(
    private readonly tournamentService: TournamentService,
    @InjectModel(Tournament.name) private tournamentModel: Model<TournamentDocument>

  ) {}

  @Post()
  async createTournament(
  @Body() createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    return this.tournamentService.create(createTournamentDto);
  }

  @Patch(':id/upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/tournaments',
      filename: renameImage
    }),
    fileFilter: fileFilter
  }))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó una imagen.');
    }
    const filePath = `/uploads/tournaments/${file.filename}`;
    return this.tournamentService.updateTournamentImage(id, filePath);
  }

  @Post(':tournamentId/participants')
  async addParticipant(@Body() createParticipantDto: AddParticipantDto) {
    return this.tournamentService.addParticipantToTournament(
      createParticipantDto.tournamentId,
      createParticipantDto.userId,
      createParticipantDto.userWeight
    );
  }

  @Delete(':tournamentId/participants/:userId')
  async removeParticipant(@Param('tournamentId') tournamentId: string, @Param('userId') userId: string,) {
    return await this.tournamentService.removeParticipantFromTournament(tournamentId, userId);
  }

  @Get(':tournamentId/divisions')
  async getTournamentDivisions(@Param('tournamentId') tournamentId: string) {
    return this.tournamentService.getTournamentDivisions(tournamentId);
  }

  @Get(':tournamentId/division/participants')
  async getDivisionParticipants(
    @Param('tournamentId') tournamentId: string,
    @Query('beltCategoryId') beltCategoryId: string,
    @Query('ageCategoryId') ageCategoryId: string,
    @Query('weightCategoryId') weightCategoryId: string
  ) {
    return this.tournamentService.getDivisionParticipants(tournamentId, {
      beltCategoryId,
      ageCategoryId,
      weightCategoryId
    });
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    await this.tournamentService.updateActiveTournaments();
  }

  @Get()
  findAll() {
    return this.tournamentService.findAll();
  }

  @Get('/active')
  findActive() {
    return this.tournamentService.findActive();
  }

  @Get('/coming-soon')
  async getComingSoonTournaments(): Promise<Tournament[]> {
    return this.tournamentService.findComingSoon();
  }

  @Get('/finished')
  async getFinishedTournaments(): Promise<Tournament[]> {
    return this.tournamentService.findFinishedTournaments();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }
  
  @Get(':tournamentId/matches')
  async getMatches(
    @Param('tournamentId') tournamentID: string, 
    @Query('status') status?: MatchStatus, 
    @Query('weightCategoryID') weightCategoryID?: string,
    @Query('ageCategoryID') ageCategoryID?: string,
    @Query('beltCategoryID') beltCategoryID?: string
  ) {
    return await this.tournamentService.getMatches(tournamentID, { status, weightCategoryID, ageCategoryID, beltCategoryID });
  }

  @Get('user/:userId')
  getTournamentByUserId(@Param('userId') userId: string) {
    return this.tournamentService.getTournamentByUserId(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTournamentDto: UpdateTournamentDto) {
    return this.tournamentService.update(id, updateTournamentDto);
  }

  @Patch(':tournamentId/judge/:userId')
  addJudge(
    @Param('tournamentId') tournamentId: string,
    @Param('userId') userId: string
  ) {
    return this.tournamentService.addJudge(tournamentId, userId);
  }

  @Patch(':tournamentId/referee/:userId')
  addReferee(
    @Param('tournamentId') tournamentId: string,
    @Param('userId') userId: string
  ) {
    return this.tournamentService.addReferee(tournamentId, userId);
  }

  @Put(':tournamentId/match/:matchId/score')
  async updateMatchScore(
    @Param('tournamentId') tournamentId: string,
    @Param('matchId') matchId: string,
    @Body() updateMatchScoreDto: UpdateMatchScoreDto
  ) {
    return await this.tournamentService.updateMatchScore(
      tournamentId,
      matchId,
      updateMatchScoreDto
    );
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(+id);
  }
}
