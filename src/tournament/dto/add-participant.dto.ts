import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddParticipantDto {
  @IsString()
  @IsNotEmpty()
  tournamentId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsNumber()
  userWeight: number;
}