import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Query,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { Auth } from 'src/auth/auth.decorator'
import { CreateTaskDto } from './task.dto'
import { TaskService } from './task.service'
import { PaginatedQueryDto } from 'src/app.interface'
import { User } from 'src/user/user.decorator'
import { UserModel } from 'src/user'
import { NotFoundInterceptor } from 'src/user/user.interceptor'

@Controller('tasks')
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@Get('')
	@Auth()
	async getAll(
		@User() user: UserModel,
		@Query(
			new ValidationPipe({
				transform: true,
				transformOptions: { enableImplicitConversion: true },
				forbidNonWhitelisted: true,
			}),
		)
		{ page = 1, limit = 30, query = '' }: PaginatedQueryDto,
	) {
		return this.taskService.getAll(user, { page: page ?? 1, limit: limit ?? 30, query })
	}

	@Get(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Задание не найдено'))
	async getById(@Param('id') id: string) {
		return this.taskService.getById(id)
	}

	@Post('/create')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	async create(@User('_id') userId: string, @Body() dto: Omit<CreateTaskDto, 'userId'>) {
		return this.taskService.create({ userId, ...dto })
	}

	@Delete(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Задание не найдено'))
	async delete(@Param('id') id: string) {
		return this.taskService.delete(id)
	}
}
