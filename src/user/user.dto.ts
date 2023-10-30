import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'

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
	@IsOptional()
	@MinLength(5, {
		message: 'Пароль не может быть меньше 5 символов',
	})
	password: string

	@IsEmail()
	email: string

	@IsEnum(['user', 'admin', 'supervisor', 'lawyer'])
	role: string
}
