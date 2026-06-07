import { IsEmail } from 'class-validator';

export class EsqueceuSenhaDto {
  @IsEmail()
  email!: string;
}
