import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypegooseModule } from 'nestjs-typegoose'
import { getJWTConfig } from 'src/config'
import { UserModel } from 'src/user/user.model'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserService } from 'src/user'

@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJWTConfig,
		}),
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'users',
				},
			},
		]),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, UserService],
})
export class AuthModule {}
