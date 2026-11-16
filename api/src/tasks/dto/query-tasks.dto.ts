import { IsEnum, IsOptional, IsString, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus } from '../enums/task-status.enum';

export class QueryTasksDto {
  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: TaskStatus;

  @IsString()
  @IsOptional()
  search?: string;

  @IsIn(['asc', 'desc'], { message: 'sortDueDate must be asc or desc' })
  @IsOptional()
  sortDueDate?: 'asc' | 'desc';

  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
