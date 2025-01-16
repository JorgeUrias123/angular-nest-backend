import { IsNumber, Min, Max } from 'class-validator';

export class UpdateMatchScoreDto {
  @IsNumber()
  @Min(0)
  @Max(99)
  player1Points: number;

  @IsNumber()
  @Min(0)
  @Max(99)
  player2Points: number;
}