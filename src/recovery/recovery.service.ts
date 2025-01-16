import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecoveryDto } from './dto/create-recovery.dto';
import { UpdateRecoveryDto } from './dto/update-recovery.dto';
import { User } from 'src/auth/entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class RecoveryService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private readonly mailerService: MailerService

  ) {}

  private generateRecoveryCode(): string {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  async requestPasswordReset(email: string) {
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      throw new NotFoundException('No se encontró un usuario con este correo');
    }

    const recoveryCode = this.generateRecoveryCode();
    const recoveryCodeExpires = new Date();
    recoveryCodeExpires.setMinutes(recoveryCodeExpires.getMinutes() + 5);

    await this.userModel.findByIdAndUpdate(user._id, {
      recoveryCode,
      recoveryCodeExpires
    });

    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperación de Contraseña - Sistema TKD',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c3e50; text-align: center;">Recuperación de Contraseña</h1>
          <p>Has solicitado restablecer tu contraseña. Tu código de verificación es:</p>
          <div style="text-align: center; padding: 20px;">
            <h2 style="color: #4a90e2; letter-spacing: 5px;">${recoveryCode}</h2>
          </div>
          <p>Este código expirará en 15 minutos.</p>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
        </div>
      `
    });
  }

  async verifyCodeAndResetPassword(email: string, code: string, newPassword: string) {
    const currentDate = new Date();
    
    const user = await this.userModel.findOne({
      email,
      recoveryCode: code,
      recoveryCodeExpires: { $gt: currentDate }
    });
  
    if (!user) {
      throw new BadRequestException('Código inválido o expirado');
    }
  
    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
  
    await this.userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      recoveryCode: null,
      recoveryCodeExpires: null
    });
  }
  
  create(createRecoveryDto: CreateRecoveryDto) {
    return 'This action adds a new recovery';
  }

  findAll() {
    return `This action returns all recovery`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recovery`;
  }

  update(id: number, updateRecoveryDto: UpdateRecoveryDto) {
    return `This action updates a #${id} recovery`;
  }

  remove(id: number) {
    return `This action removes a #${id} recovery`;
  }
}
