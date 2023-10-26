import { IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsString()
	login: string
	@IsString()
	@MinLength(5, {
		message: 'Пароль не может быть меньше 5 символов',
	})
	password: string
}
