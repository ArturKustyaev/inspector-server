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
import { Auth } from 'src/auth/auth.decorator'
import { User } from './user.decorator'
import { GetUsersQueryDTO, UpdateUserDTO } from './user.dto'
import { NotFoundInterceptor } from './user.interceptor'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('/my-profile')
	@Auth()
	async getProfile(@User('_id') id: string) {
		return this.userService.getById(id)
	}

	@Get('')
	@Auth()
	async getAll(
		@Query(
			new ValidationPipe({
				transform: true,
				transformOptions: { enableImplicitConversion: true },
				forbidNonWhitelisted: true,
			}),
		)
		{ page, limit, query }: GetUsersQueryDTO,
	) {
		return this.userService.getAll({ page: page ?? 1, limit: limit ?? 30, query })
	}

	@Get(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Пользователь не найден'))
	async getById(@Param('id') id: string) {
		return this.userService.getById(id)
	}

	@Post('/create')
	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	async create(@Body() dto: UpdateUserDTO) {
		return this.userService.create(dto)
	}

	@Put(':id')
	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@UseInterceptors(new NotFoundInterceptor('Пользователь не найден'))
	async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
		return this.userService.update(id, dto)
	}

	@Delete(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Пользователь не найден'))
	async deleteUser(@Param('id') id: string) {
		return this.userService.delete(id)
	}
}
