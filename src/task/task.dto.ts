import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator'
import { ReviewStatus, TaskStatus } from './task.interface'

export class CreateTaskDto {
	@IsString()
	title: string

	@IsString()
	@IsOptional()
	discoveryDate: string

	@IsString()
	@IsOptional()
	violationType: string

	@IsString()
	@IsOptional()
	district: string

	@IsString()
	@IsOptional()
	location: string

	@IsString()
	@IsOptional()
	description: string
}

export class UpdateTaskDto {
	@IsString()
	violationId: string

	@IsString()
	@IsOptional()
	title: string

	@IsString()
	@IsOptional()
	discoveryDate: string

	@IsString()
	@IsOptional()
	violationType: string

	@IsString()
	@IsOptional()
	district: string

	@IsString()
	@IsOptional()
	location: string

	@IsString()
	@IsOptional()
	description: string
}

export class ChangeStatusDto {
	@IsString()
	id: string

	@IsEnum(TaskStatus)
	status: TaskStatus
}

export class UpdateCourtDto {
	@IsString()
	violationId: string

	@IsString()
	endDate: string

	@IsString()
	courtDecision: string

	@IsNumber()
	amount: number
}

export class UpdateReviewsDto {
	@IsString()
	id: string

	@IsEnum(ReviewStatus)
	status: ReviewStatus

	@IsString()
	date: string

	@IsString()
	@IsOptional()
	message: string
}
