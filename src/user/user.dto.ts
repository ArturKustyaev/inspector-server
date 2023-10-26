import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength, isEnum } from 'class-validator'

export class GetUsersQueryDTO {
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

export class UpdateUserDTO {
	@IsString()
	firstName: string

	@IsString()
	lastName: string

	@IsString()
	middleName: string

	@IsString()
	login: string

	@IsString()
	@MinLength(5, {
		message: 'Пароль не может быть меньше 5 символов',
	})
	password: string

	@IsEmail()
	email: string

	@IsEnum(['user', 'admin', 'supervisor', 'lawyer'])
	role: string
}
