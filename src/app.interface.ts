import { IsNumber, IsOptional, IsString } from 'class-validator'

export class PaginatedQueryDto {
	@IsNumber()
	@IsOptional()
	page?: number

	@IsNumber()
	@IsOptional()
	limit?: number

	@IsString()
	@IsOptional()
	query?: string
}
