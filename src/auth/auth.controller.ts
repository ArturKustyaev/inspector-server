import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from '@nestjs/common'
import { UpdateUserDto } from 'src/user/user.dto'
import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { RefreshTokenDto } from './dto/refreshToken.dto'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('login')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async login(@Body() dto: AuthDto) {
		return this.authService.login(dto)
	}

	@Post('register')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async register(@Body() dto: UpdateUserDto) {
		return this.authService.register(dto)
	}

	@Post('refresh-token')
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async refreshToken(@Body() dto: RefreshTokenDto) {
		return this.authService.refreshToken(dto)
	}
}
