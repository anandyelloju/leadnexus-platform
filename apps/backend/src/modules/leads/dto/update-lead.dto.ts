import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { EmploymentType } from './create-lead.dto';

export class UpdateLeadDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  salary?: number;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  loanAmount?: number;

  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;
}
