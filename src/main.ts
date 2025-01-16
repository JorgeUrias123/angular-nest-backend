import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import { TournamentService } from './tournament/tournament.service';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  //! Habilitar cors necesario para realizar peticiones desde el front de diferentes dominios
  app.enableCors();

  app.use('/uploads/news', express.static(join(__dirname, '..', 'uploads', 'news')));

  app.use('/uploads/tournaments', express.static(join(__dirname, '..', 'uploads', 'tournaments')));



  app.useGlobalPipes(
    new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    })
  );
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
