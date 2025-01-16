import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcryptjs from 'bcryptjs'
import { JwtService } from '@nestjs/jwt';


import { Rol, User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, LoginDto, RegisterUserDto } from './dto/index';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { MatchStatus, Tournament, TournamentDocument } from 'src/tournament/entities/tournament.entity';
import { TournamentService } from 'src/tournament/tournament.service';

@Injectable()
export class AuthService {

  private readonly logger = new Logger(TournamentService.name);


  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Tournament.name)
    private readonly tournamentModel: Model<TournamentDocument>,

    private jwtService: JwtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const {password, ...userData} = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

      await newUser.save();

      const {password:_, ...user} = newUser.toJSON();

      return user
    } catch (error) {

      if ( error.code === 11000 ) {
        throw new BadRequestException(`${createUserDto.email} este correo electronico ya existe`);
      }
      throw new InternalServerErrorException('Algo terrible ha pasado!!!');
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {
    const user = await this.create( registerUserDto );

    return {
      user: user,
      token: this.getJwtToken({id: user._id})
    }
  }

  async login( loginDto: LoginDto ) {
    const {email, password} = loginDto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (!bcryptjs.compareSync( password, user.password )) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const { password:_, ...rest } = user.toJSON();
    return {
      user: rest,
      token: this.getJwtToken({ id: user.id })
    }
    
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userModel.findById( id );
    const {password, ...rest} = user.toJSON();

    return rest;
  }

  async findUsersCompetitors(): Promise<User[]> {
    const user = await this.userModel.find({
      rol: Rol.Competidor
    });

    return user;

  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true }
    );

    if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...rest } = updatedUser.toJSON();
    return rest; 
  }

  async remove(id: string) {
    try {
      // Encontrar todos los torneos futuros
      const currentDate = new Date();
      const tournaments = await this.tournamentModel.find({
        startDate: { $gt: currentDate }
      });

      // Procesar cada torneo
      for (const tournament of tournaments) {
        let participantRemoved = false;

        // Recorrer las divisiones para encontrar al participante
        for (const division of tournament.divisions) {
          for (const ageCategory of division.ageCategories) {
            for (const weightCategory of ageCategory.weightCategories) {
              if (!weightCategory.participants) continue;

              const participantIndex = weightCategory.participants.findIndex(
                participant => participant.toString() === id
              );

              if (participantIndex !== -1) {
                // Si encontramos al participante, procesar sus matches
                if (weightCategory.matches) {
                  const participantMatches = weightCategory.matches.filter(match =>
                    match.player1?.toString() === id || 
                    match.player2?.toString() === id
                  );

                  // Verificar si hay matches en progreso o completados
                  for (const match of participantMatches) {
                    if (match.status === MatchStatus.InProgress || 
                        match.status === MatchStatus.Completed) {
                      // Loggear pero continuar, ya que estamos eliminando el usuario
                      this.logger.warn(
                        `Usuario ${id} tiene matches ${match.status} en torneo ${tournament._id}`
                      );
                    }
                  }

                  // Actualizar o eliminar matches
                  weightCategory.matches = weightCategory.matches.filter(match => {
                    // Eliminar match si el participante está solo
                    if (match.player1?.toString() === id && !match.player2) {
                      return false;
                    }
                    
                    // Si el participante es player2, removerlo
                    if (match.player2?.toString() === id) {
                      match.player2 = undefined;
                      match.status = MatchStatus.Pending;
                    }
                    
                    // Si el participante es player1 y hay player2, mover player2 a player1
                    if (match.player1?.toString() === id && match.player2) {
                      match.player1 = match.player2;
                      match.player2 = undefined;
                      match.status = MatchStatus.Pending;
                    }
                    
                    return true;
                  });
                }

                // Remover al participante
                weightCategory.participants.splice(participantIndex, 1);
                participantRemoved = true;
                tournament.participantsCount = Math.max(0, tournament.participantsCount - 1);
                break;
              }
            }
            if (participantRemoved) break;
          }
          if (participantRemoved) break;
        }

        // Remover de jueces y árbitros si está presente
        if (tournament.judges) {
          tournament.judges = tournament.judges.filter(judgeId => 
            judgeId.toString() !== id
          );
        }
        
        if (tournament.referees) {
          tournament.referees = tournament.referees.filter(refereeId => 
            refereeId.toString() !== id
          );
        }

        // Guardar los cambios del torneo
        await tournament.save();
      }

      // Finalmente, eliminar al usuario
      const deletedUser = await this.userModel.findByIdAndDelete(id);
      if (!deletedUser) {
        throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
      }

      return deletedUser;

    } catch (error) {
      this.logger.error(`Error al eliminar usuario: ${error.message}`, error.stack);
      throw error;
    }
}

  getJwtToken( payload: JwtPayload) {
    const token = this.jwtService.sign( payload );
    return token;
  }
}
