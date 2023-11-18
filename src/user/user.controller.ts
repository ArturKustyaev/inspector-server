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
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { PaginatedQueryDto } from 'src/app.interface'
import { Auth } from 'src/auth/auth.decorator'
import { User } from './user.decorator'
import { UpdateUserDTO } from './user.dto'
import { NotFoundInterceptor } from './user.interceptor'
import { UserService } from './user.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { existsSync, mkdirSync } from 'fs'

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
		{ page, limit, query }: PaginatedQueryDto,
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
	@UseInterceptors(FileInterceptor('file', { 
		storage: diskStorage({
			destination: (req: any, file: any, cb: any) => {
				const uploadPath = "./uploads/"

				if(!existsSync(uploadPath)) {
					mkdirSync(uploadPath)
				}

				if(!existsSync(`${uploadPath}/${req.params.id}`)) {
					mkdirSync(`${uploadPath}/${req.params.id}`)
				}
				cb(null, uploadPath)
			},
			filename: (req: any, file: any, cb: any) => {
				
				cb(null, `${req.params.id}/avatar.${file.originalname.split(".")[1]}`);
			},
		})
	}))
	async update(@Param('id') id: string, @Body() dto: UpdateUserDTO, @UploadedFile() file: Express.Multer.File) {
		return this.userService.update(id, dto, file.originalname.split(".")[1])
	}

	@Delete(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Пользователь не найден'))
	async delete(@Param('id') id: string) {
		return this.userService.delete(id)
	}
}
