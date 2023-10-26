import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { UserController } from './user.controller'
import { UserModel } from './user.model'
import { UserService } from './user.service'

@Module({
	imports: [
		ConfigModule,
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'users',
				},
			},
		]),
	],
	providers: [UserService],
	controllers: [UserController],
})
export class UserModule {}
