import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { compare, genSalt, hash } from 'bcryptjs'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel, UserService } from 'src/user'
import { AuthDto } from './dto/auth.dto'
import { JwtService } from '@nestjs/jwt'
import { RefreshTokenDto } from './dto/refreshToken.dto'
import { UpdateUserDto } from 'src/user/user.dto'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)
		const tokens = await this.getTokenPairs(String(user._id))

		return {
			user: this.userService.getPublicUserFields(user),
			...tokens,
		}
	}

	async register(dto: UpdateUserDto) {
		const oldUser = await this.userModel.findOne({ login: dto.login })

		if (oldUser) {
			throw new BadRequestException('Пользователь с таким логином уже существует')
		}

		const salt = await genSalt(10)

		const newUser = new this.userModel({
			login: dto.login,
			firstName: dto.firstName,
			lastName: dto.lastName,
			middleName: dto.middleName,
			password: await hash(dto.password, salt),
			role: dto.role,
		})

		const tokens = await this.getTokenPairs(String(newUser._id))

		await newUser.save()

		return {
			user: this.userService.getPublicUserFields(newUser),
			...tokens,
		}
	}

	async refreshToken({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) {
			throw new UnauthorizedException('Пожалуйста, войдите в систему')
		}

		try {
			const result = await this.jwtService.verifyAsync(refreshToken)
			const user = await this.userModel.findById(result._id)
			const tokens = await this.getTokenPairs(String(user._id))

			return {
				user: this.userService.getPublicUserFields(user),
				...tokens,
			}
		} catch {
			throw new UnauthorizedException('Невалидный токен авторизации')
		}
	}

	async validateUser(dto: AuthDto) {
		const user = await this.userModel.findOne({ login: dto.login })

		if (!user) {
			throw new BadRequestException('Неверный логин или пароль')
		}

		const isValidPassword = await compare(dto.password, user.password)

		if (!isValidPassword) {
			throw new BadRequestException('Неверный логин или пароль')
		}

		return user
	}

	async getTokenPairs(userId: string) {
		const payload = { _id: userId }

		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: '1h',
		})

		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: '15d',
		})

		return {
			accessToken,
			refreshToken,
		}
	}
}
