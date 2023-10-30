import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { UserController, UserModel, UserService } from 'src/user'
import { TaskController } from './task.controller'
import { TaskModel } from './task.model'
import { TaskService } from './task.service'

@Module({
	imports: [
		ConfigModule,
		TypegooseModule.forFeature([
			{
				typegooseClass: TaskModel,
				schemaOptions: {
					collection: 'tasks',
				},
			},
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'users',
				},
			},
		]),
	],
	providers: [TaskService, UserService],
	controllers: [TaskController, UserController],
})
export class TaskModule {}
