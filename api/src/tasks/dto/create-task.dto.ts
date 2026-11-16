import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus } from '../enums/task-status.enum';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Title must not be empty' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: TaskStatus;

  @IsDateString({}, { message: 'Due date must be a valid ISO date string' })
  @IsOptional()
  dueDate?: string;
}
