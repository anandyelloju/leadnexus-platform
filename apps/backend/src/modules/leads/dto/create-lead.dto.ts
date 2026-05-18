import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export enum EmploymentType {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
}

export class CreateLeadDto {
  @IsString()
  name!: string;

  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message:
      'Phone number must be valid Indian mobile number',
  })
  phone!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  loanAmount?: number;

  @IsString()
  source!: string;
}
