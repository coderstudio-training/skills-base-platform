import { IsNotEmpty, IsString } from 'class-validator';

export class GrafanaAlertDto {
  @IsNotEmpty()
  @IsString()
  alert: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}
