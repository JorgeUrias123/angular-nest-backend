import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export enum Gender {
  Hombre = 'Hombre',
  Mujer = 'Mujer'
}

export enum Rol {
  Admin = 'Admin',
  Competidor = 'Competidor',
  Arbitro = 'Arbitro',
  Juez = 'Juez'
}

export enum Belt {
  Blanco = 'Blanco',
  Blanco_Amarillo = 'Blanco-Amarillo',
  Amarillo = 'Amarillo',
  Amarillo_Verde = 'Amarillo-Verde',
  Verde = 'Verde',
  Verde_Azul = 'Verde-Azul',
  Azul = 'Azul',
  Azul_Rojo = 'Azul-Rojo',
  Rojo = 'Rojo',
  Rojo_Negro = 'Rojo-Negro',
  Negro_1erDan = 'Negro-1erDan',
  Negro_2doDan = 'Negro-2doDan',
  Negro_3erDan = 'Negro-3erDan',
  Negro_4toDan = 'Negro-4toDan',
  Negro_5toDan = 'Negro-5toDan',
  Negro_6toDan = 'Negro-6toDan',
  Negro_7moDan = 'Negro-7moDan',
  Negro_8vorDan = 'Negro-8voDan',
  Negro_9noDan = 'Negro-9noDan',
  Negro_10moDan = 'Negro-10moDan',
}

@Schema()
export class User {

  _id?: string;
  
  @Prop({required: true})
  name: string;
  
  @Prop({required: true})
  lastName1: string;

  @Prop({required: true})
  lastName2: string;
  
  @Prop({required: true})
  age: number;
  
  @Prop({enum: Gender, required: true})
  gender: Gender

  @Prop({required: false, enum: Belt})
  belt?: Belt

  @Prop({unique: true, required: true})
  email: string;

  @Prop({minlength:6, required: true})
  password?: string

  @Prop({enum: Rol, required: true, default: 'Admin'})
  rol: Rol

  @Prop()
  recoveryCode?: string;

  @Prop()
  recoveryCodeExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass( User );
