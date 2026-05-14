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
  @Matches(/^[0-9+\\-\\s()]{10,}$/, {
    message: 'phone must be a valid phone number',
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