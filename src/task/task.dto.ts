import { IsString } from 'class-validator'

export class CreateTaskDto {
	@IsString()
	userId: string

	@IsString()
	title: string

	@IsString()
	description: string
}
