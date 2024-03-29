import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { PaginatedQueryDto } from 'src/app.interface'
import { Auth } from 'src/auth/auth.decorator'
import { UserModel } from 'src/user'
import { User } from 'src/user/user.decorator'
import { NotFoundInterceptor } from 'src/user/user.interceptor'
import { ChangeStatusDto, CreateTaskDto, UpdateCourtDto, UpdateReviewsDto, UpdateTaskDto } from './task.dto'
import { TaskService } from './task.service'

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
		{ page, limit, query }: PaginatedQueryDto,
	) {
		return this.taskService.getAll(user, { page, limit, query })
	}

	@Get(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Запись о нарушении не найдена'))
	async getById(@Param('id') id: string) {
		return this.taskService.getById(id)
	}

	@Post('/create')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	async create(@User('_id') userId: string, @Body() dto: CreateTaskDto) {
		return this.taskService.create(userId, dto)
	}

	@Put('/update')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	async update(@Body() dto: UpdateTaskDto) {
		return this.taskService.update(dto)
	}

	@Delete(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Запись о нарушении не найдена'))
	async delete(@User() user: UserModel, @Param('id') id: string) {
		return this.taskService.delete(user, id)
	}

	@Post('change-status')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	@UseInterceptors(new NotFoundInterceptor('Запись о нарушении не найдена'))
	async changeStatus(@Body() dto: ChangeStatusDto) {
		return this.taskService.changeStatus(dto)
	}

	@Post('approve')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	@UseInterceptors(new NotFoundInterceptor('Запись о нарушении не найдена'))
	async approveViolation(@User('_id') id: string, @Body() dto: UpdateReviewsDto) {
		return this.taskService.approveViolation(id, dto)
	}

	@Put('update-court')
	@HttpCode(200)
	@Auth()
	@UsePipes(new ValidationPipe())
	@UseInterceptors(new NotFoundInterceptor('Запись о нарушении не найдена'))
	async updateCourt(@Body() dto: UpdateCourtDto) {
		return this.taskService.updateCourtInfo(dto)
	}
}
