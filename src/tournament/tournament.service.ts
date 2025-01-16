import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Match, MatchStatus, Score, Tournament, TournamentDocument } from './entities/tournament.entity';
import { Model, Types } from 'mongoose';
import { User } from 'src/auth/entities/user.entity';
import { BeltCategory } from 'src/belt-category/entities/belt-category.entity';
import { AgeCategory } from 'src/age-category/entities/age-category.entity';
import { WeightCategory } from 'src/weight-category/entities/weight-category.entity';


@Injectable()
export class TournamentService {

  private readonly logger = new Logger(TournamentService.name);


  constructor(
    
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<TournamentDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(BeltCategory.name)
    private readonly beltCategoryModel: Model<BeltCategory>,
    @InjectModel(AgeCategory.name)
    private readonly ageCategoryModel: Model<AgeCategory>,
    @InjectModel(WeightCategory.name)
    private readonly weightCategoryModel: Model<WeightCategory>,
  ) {}

  async create(createTournamentDto: CreateTournamentDto): Promise<Tournament> {
    const createdTournament = new this.tournamentModel( createTournamentDto );
    return createdTournament.save();
  }

  async updateTournamentImage(id: string, file: string): Promise<Tournament> {
    const tournament = await this.tournamentModel.findById(id);
  
    if (!tournament) {
      throw new NotFoundException('Torneo no encontrado.');
    }
  
    const filePath = file;
    const fileUrl = `${process.env.URI_IMAGES}${filePath}`;
  
    tournament.image = filePath;
    tournament.imageUrl = fileUrl;
  
    return tournament.save();
  }

  async addParticipantToTournament( tournamentId: string, userId: string, userWeight: number): Promise<Tournament> {
    try {

      const tournament = await this.tournamentModel.findById(tournamentId);
      if (!tournament) {
        throw new BadRequestException(`Torneo con ID ${tournamentId} no encontrado`);
      }
      
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new BadRequestException(`Usuario con ID ${userId} no encontrado`);
      }
      
      const currentDate = new Date();
      if (currentDate > tournament.registrationDeadline) {
        throw new BadRequestException('El periodo de registro ha finalizado');
      }
      
      const beltCategory = await this.beltCategoryModel.findOne({
        belts: { $in: [user.belt] },
      });
      if (!beltCategory) {
        throw new BadRequestException(`No se encontró categoría de cinturón para ${user.belt}`);
      }
      
      const ageCategory = await this.ageCategoryModel.findOne({
        min: { $lte: user.age },
        max: { $gte: user.age },
      });
      if (!ageCategory) {
        throw new BadRequestException(`No se encontró categoría de edad para ${user.age}`);
      }
      
      const weightCategory = await this.weightCategoryModel.findOne({
        wMin: { $lte: userWeight },
        wMax: { $gte: userWeight },
      });
      if (!weightCategory) {
        throw new BadRequestException(`No se encontró categoría de peso para ${userWeight}`);
      }
      

      const divisionIndex = tournament.divisions.findIndex(
        (division) =>
          division.beltCategory.toString() === beltCategory._id.toString() &&
          division.ageCategories.some((age) =>
            age.ageCategory.toString() === ageCategory._id.toString() &&
            age.weightCategories.some(
              (weight) => weight.weightCategory.toString() === weightCategory._id.toString()
            )
          )
      );
  
      if (divisionIndex === -1) {
        throw new BadRequestException('No se encontró una división adecuada en este torneo');
      }
  
      const ageCategoryIndex = tournament.divisions[divisionIndex].ageCategories.findIndex(
        (age) => age.ageCategory.toString() === ageCategory._id.toString()
      );

      const weightCategoryIndex = tournament.divisions[divisionIndex].ageCategories[
        ageCategoryIndex
      ].weightCategories.findIndex(
        (weight) => weight.weightCategory.toString() === weightCategory._id.toString()
      );

      const weightCategories = tournament.divisions[divisionIndex].ageCategories[ageCategoryIndex].weightCategories[weightCategoryIndex];
  
      const participants = weightCategories.participants || [];

      if (participants.length > 16) {
        throw new BadRequestException(
          'Se alcanzó el límite máximo de participantes en esta división'
        );
      }
  
      const isAlreadyRegistered = participants.some(
        (participant) => participant.toString() === userId
      );

      if (isAlreadyRegistered) {
        throw new BadRequestException('El usuario ya está registrado en esta división');
      }

      if (!weightCategories.matches) {
        weightCategories.matches = [];
      }
      
      participants.push(new Types.ObjectId(userId));

      if (weightCategories.matches.length === 0) {
        const newMatch: Match = {
          _id: new Types.ObjectId().toString(),
          player1: new Types.ObjectId(userId),
          status: MatchStatus.Pending,
          score: null,
          round: 1,
        };
        weightCategories.matches.push(newMatch);
      } else {
        const existingIncompleteMatch = weightCategories.matches.find(match => 
          match.player1 && !match.player2 && match.status === MatchStatus.Pending
        );

        if (existingIncompleteMatch) {
          existingIncompleteMatch.player2 = new Types.ObjectId(userId);
        } else {
          const unassignedParticipant = participants.find(participant => {
            return !weightCategories.matches.some(match => 
              match.player1?.toString() === participant.toString() || match.player2?.toString() === participant.toString()
            );
          });

          if (unassignedParticipant && unassignedParticipant.toString() !== userId) {
            const newMatch: Match = {
              _id: new Types.ObjectId().toString(),
              player1: unassignedParticipant,
              player2: new Types.ObjectId(userId),
              status: MatchStatus.Pending,
              score: null,
              round: 1,
            };
            weightCategories.matches.push(newMatch);
          } else if(participants.length > 1) {
            const newMatch: Match = {
              _id: new Types.ObjectId().toString(),
              player1: new Types.ObjectId(userId),
              status: MatchStatus.Pending,
              score: null,
              round: 1,
            };
            weightCategories.matches.push(newMatch);
          }
        }
      }

      tournament.divisions[divisionIndex].ageCategories[ageCategoryIndex].weightCategories[weightCategoryIndex] = weightCategories;

      tournament.participantsCount += 1;

      const updatedTournament = await tournament.save();
      return updatedTournament;

    } catch (error) {
      this.logger.error(`Error al agregar participante: ${error.message}`, error.stack);
      throw error;
    }
  }

  async removeParticipantFromTournament(
    tournamentId: string,
    userId: string
  ): Promise<Tournament> {
    try {
      const tournament = await this.tournamentModel.findById(tournamentId);
      if (!tournament) {
        throw new BadRequestException(`Torneo con ID ${tournamentId} no encontrado`);
      }
  
      const currentDate = new Date();
      if (currentDate > tournament.startDate) {
        throw new BadRequestException('No se puede retirar participantes una vez iniciado el torneo');
      }
  
      let participantFound = false;
      let participantRemoved = false;
  
      for (const division of tournament.divisions) {
        for (const ageCategory of division.ageCategories) {
          for (const weightCategory of ageCategory.weightCategories) {
            if (!weightCategory.participants) continue;
  
            const participantIndex = weightCategory.participants.findIndex(
              participant => participant.toString() === userId
            );
  
            if (participantIndex !== -1) {
              participantFound = true;
  
              if (weightCategory.matches) {
                const participantMatches = weightCategory.matches.filter(match =>
                  match.player1?.toString() === userId || 
                  match.player2?.toString() === userId
                );
  
                for (const match of participantMatches) {
                  if (match.status === MatchStatus.InProgress) {
                    throw new BadRequestException('No se puede retirar un participante con peleas en progreso');
                  }
  
                  if (match.status === MatchStatus.Completed) {
                    throw new BadRequestException('No se puede retirar un participante con peleas completadas');
                  }
                }
  
                weightCategory.matches = weightCategory.matches.filter(match => {

                  if (match.player1?.toString() === userId && !match.player2) {
                    return false;
                  }
                  
                  if (match.player2?.toString() === userId) {
                    match.player2 = undefined;
                    match.status = MatchStatus.Pending;
                  }
                  
                  if (match.player1?.toString() === userId && match.player2) {
                    match.player1 = match.player2;
                    match.player2 = undefined;
                    match.status = MatchStatus.Pending;
                  }
                  
                  return true;
                });
              }
  
              weightCategory.participants.splice(participantIndex, 1);
              participantRemoved = true;
              tournament.participantsCount -= 1;
              break;
            }
          }
          if (participantRemoved) break;
        }
        if (participantRemoved) break;
      }
  
      if (!participantFound) {
        throw new BadRequestException('El participante no está registrado en este torneo');
      }
  
      const updatedTournament = await tournament.save();
      return updatedTournament;
  
    } catch (error) {
      this.logger.error(`Error al retirar participante: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTournamentByUserId(userId: string): Promise<any[]> {    
    const tournament = await this.tournamentModel.find({
      _userId: userId
    });

    return tournament;
  }

  async getTournamentDivisions(tournamentId: string): Promise<any[]> {
    const tournament = await this.tournamentModel
      .findById(tournamentId)
      .populate({
        path: 'divisions.beltCategory',
        model: 'BeltCategory'
      })
      .populate({
        path: 'divisions.ageCategories.ageCategory',
        model: 'AgeCategory'
      })
      .populate({
        path: 'divisions.ageCategories.weightCategories.weightCategory',
        model: 'WeightCategory'
      });

    if (!tournament) {
      throw new BadRequestException('El torneo no existe');
    }

    return tournament.divisions.map(division => ({
      beltCategory: division.beltCategory,
      ageCategories: division.ageCategories.map(ageCategory => ({
        ageCategory: ageCategory.ageCategory,
        weightCategories: ageCategory.weightCategories.map(weightCategory => ({
          weightCategory: weightCategory.weightCategory,
          participantsCount: weightCategory.participants?.length || 0
        }))
      }))
    }));
  }

  async getDivisionParticipants(tournamentId: string, divisionParams: { beltCategoryId: string, ageCategoryId: string, weightCategoryId: string }): Promise<User[]> {
    const tournament = await this.tournamentModel.findById(tournamentId);
  
    if (!tournament) {
      throw new BadRequestException('El torneo no existe');
    }
  
    const division = tournament.divisions.find(
      div => 
        div.beltCategory.toString() === divisionParams.beltCategoryId &&
        div.ageCategories.some(
          ageCategory => 
            ageCategory.ageCategory.toString() === divisionParams.ageCategoryId &&
            ageCategory.weightCategories.some(
              weightCategory => 
                weightCategory.weightCategory.toString() === divisionParams.weightCategoryId
            )
        )
    );
  
    if (!division) {
      throw new BadRequestException('La división no existe en este torneo');
    }
  
    const participantIds: string[] = [];
    division.ageCategories.forEach(ageCategory => 
      ageCategory.weightCategories.forEach(weightCategory => 
        participantIds.push(...(weightCategory.participants || []).map(p => p.toString()))
      )
    );
  
    return this.userModel.find({ _id: { $in: participantIds } }).exec();
  }

  async getMatches(tournamentID: string, filters?: { status?: MatchStatus; weightCategoryID?: string; ageCategoryID?: string; beltCategoryID?: string }): Promise<any[]> {
    try{

      const tournament = await this.tournamentModel.findById(tournamentID)
      .populate('divisions.beltCategory')
      .populate('divisions.ageCategories.ageCategory')
      .populate('divisions.ageCategories.weightCategories.weightCategory')
      .populate('divisions.ageCategories.weightCategories.matches.player1')
      .populate('divisions.ageCategories.weightCategories.matches.player2');

      if (!tournament) {
        throw new BadRequestException(`Torneo con ID ${tournamentID} no encontrado`);
      }

      let allMatches = [];

      tournament.divisions.forEach(division => {
        division.ageCategories.forEach(ageCategory => {
          ageCategory.weightCategories.forEach(weightCategory => {
            if (weightCategory.matches) {
              const matchesWithContext = weightCategory.matches.map(match => ({
                _id: match._id,
                player1: match.player1,
                player2: match.player2,
                score: match.score,
                status: match.status,
                round: match.round,
                beltCategory: division.beltCategory,
                ageCategory: ageCategory.ageCategory,
                weightCategory: weightCategory.weightCategory
              }));

              allMatches = allMatches.concat(matchesWithContext);
            }
          });
        });
      });

      if (filters) {
        if (filters.status) {
          allMatches = allMatches.filter(match => match.status === filters.status);
        }

        if (filters.weightCategoryID && filters.ageCategoryID && filters.beltCategoryID) {
          allMatches = allMatches.filter(match => 
            match.weightCategory._id.toString() === filters.weightCategoryID &&
            match.ageCategory._id.toString() === filters.ageCategoryID &&
            match.beltCategory._id.toString() === filters.beltCategoryID
          );
        }
      }

      const formattedMatches = allMatches.map(match => ({
        _id: match._id,
        status: match.status,
        player1: match.player1 ? {
          _id: match.player1._id,
          name: `${match.player1.name} ${match.player1.lastName1} ${match.player1.lastName2}`,
        }: null,
        player2: match.player2 ? {
          _id: match.player2._id,
          name: `${match.player2.name} ${match.player2.lastName1} ${match.player2.lastName2}`,
        }: null,
        score: match.score,
        round: match.round,
        winner: match.winner,
        categories: {
          belt: match.beltCategory.name,
          age: match.ageCategory.name,
          weight: match.weightCategory.name
        }
      }));

      return formattedMatches;

    }catch (error) {
      this.logger.error(`Error al obtener matches: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updateActiveTournaments(): Promise<void> {
    const currentDate = new Date();

    await this.tournamentModel.updateMany(
      {
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate }
      },
      { $set: { isActive: true } }
    ).exec();

    await this.tournamentModel.updateMany(
      {
        endDate: { $lt: currentDate }
      },
      { $set: { isActive: false } }
    ).exec();
  }

  findAll(): Promise<Tournament[]> {
    return this.tournamentModel.find();
  }

  async findActive(): Promise<Tournament[]> {
    const currentDate = new Date();
  
    const activeTournaments = await this.tournamentModel.find({
      startDate: { $lte: currentDate }
    }).exec();
    
    return activeTournaments;
  }

  async findComingSoon(): Promise<Tournament[]> {
    const currentDate = new Date();

    return this.tournamentModel.find({ startDate: { $gt: currentDate } }).exec();
  }

  async findFinishedTournaments(): Promise<Tournament[]> {
    const currentDate = new Date();
  
    return this.tournamentModel.find({ 
      endDate: { $lt: currentDate } 
    })
    .sort({ endDate: -1 })
    .select('-__v')
    .exec();
  }

  findOne(id: string) {
    return this.tournamentModel.findById(id);
  }

  async addJudge(tournamentId: string, userId: string): Promise<Tournament> {
    try {
      const tournament = await this.tournamentModel.findById(tournamentId);
      
      if (!tournament) {
        throw new NotFoundException('Torneo no encontrado');
      }
  
      if (!tournament.judges) {
        tournament.judges = [];
      }
  
      if (tournament.judges.length >= 10) {
        throw new BadRequestException('El torneo ya tiene el máximo de 10 jueces');
      }
  
      if (tournament.judges.includes(new Types.ObjectId(userId))) {
        throw new BadRequestException('El juez ya está registrado en este torneo');
      }
  
      tournament.judges.push(new Types.ObjectId(userId));
      return await tournament.save();
  
    } catch (error) {
      if (error.name === 'BadRequestException') throw error;
      if (error.name === 'NotFoundException') throw error;
      throw new InternalServerErrorException('Error al agregar el juez');
    }
  }
  
  async addReferee(tournamentId: string, userId: string): Promise<Tournament> {
    try {
      const tournament = await this.tournamentModel.findById(tournamentId);
      
      if (!tournament) {
        throw new NotFoundException('Torneo no encontrado');
      }
  
      if (!tournament.referees) {
        tournament.referees = [];
      }
  
      if (tournament.referees.length >= 10) {
        throw new BadRequestException('El torneo ya tiene el máximo de 10 árbitros');
      }
  
      if (tournament.referees.includes(new Types.ObjectId(userId))) {
        throw new BadRequestException('El árbitro ya está registrado en este torneo');
      }
  
      tournament.referees.push(new Types.ObjectId(userId));
      return await tournament.save();
  
    } catch (error) {
      if (error.name === 'BadRequestException') throw error;
      if (error.name === 'NotFoundException') throw error;
      throw new InternalServerErrorException('Error al agregar el árbitro');
    }
  }


  async update(id: string, updateTournamentDto: UpdateTournamentDto): Promise<Tournament> {
    const updatedTournament = await this.tournamentModel.findByIdAndUpdate(
      id, 
      updateTournamentDto,
      {new: true}
    );

    return updatedTournament;
  }

  remove(id: number) {
    return `This action removes a #${id} tournament`;
  }

  async updateMatchScore(
    tournamentId: string,
    matchId: string,
    scoreData: {
      player1Points: number;
      player2Points: number;
    }
  ): Promise<Tournament> {
    try {
      const tournament = await this.tournamentModel.findById(tournamentId);
      if (!tournament) {
        throw new NotFoundException(`Torneo con ID ${tournamentId} no encontrado`);
      }

      let matchFound = false;
      let currentWeightCategory: any = null;
      let winningMatch: any = null;

      for (const division of tournament.divisions) {
        for (const ageCategory of division.ageCategories) {
          for (const weightCategory of ageCategory.weightCategories) {
            if (!weightCategory.matches) continue;

            const matchIndex = weightCategory.matches.findIndex(
              match => match._id === matchId
            );

            if (matchIndex !== -1) {
              const match = weightCategory.matches[matchIndex];
              if (!match.player2) {
                throw new BadRequestException('No se puede actualizar el score de un match sin dos jugadores');
              }

              const winner = scoreData.player1Points > scoreData.player2Points 
                ? match.player1 
                : match.player2;

              weightCategory.matches[matchIndex].score = {
                player1Points: scoreData.player1Points,
                player2Points: scoreData.player2Points,
                winner: winner
              };
              weightCategory.matches[matchIndex].status = MatchStatus.Completed;

              currentWeightCategory = weightCategory;
              winningMatch = weightCategory.matches[matchIndex];
              matchFound = true;
              break;
            }
          }
          if (matchFound) break;
        }
        if (matchFound) break;
      }

      if (!matchFound || !winningMatch) {
        throw new NotFoundException(`Match con ID ${matchId} no encontrado`);
      }

      if (currentWeightCategory) {
        const currentRound = winningMatch.round || 1;
        const nextRound = currentRound + 1;

        const existingNextRoundMatch = currentWeightCategory.matches.find(
          match => 
            match.round === nextRound && 
            match.player1 && 
            !match.player2 && 
            match.status === MatchStatus.Pending
        );

        if (existingNextRoundMatch) {
          existingNextRoundMatch.player2 = winningMatch.score.winner;
        } else {
          const newMatch: Match = {
            _id: new Types.ObjectId().toString(),
            player1: winningMatch.score.winner,
            status: MatchStatus.Pending,
            round: nextRound
          };
          currentWeightCategory.matches.push(newMatch);
        }

        if (nextRound === 4) {
          console.log('Torneo completado en esta categoría');
        }
      }

      const updatedTournament = await tournament.save();
      return updatedTournament;

    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error al actualizar score del match: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error al actualizar el score del match');
    }
  }
}
