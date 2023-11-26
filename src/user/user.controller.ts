import {
	Body,
	Controller,
	Delete,
	FileTypeValidator,
	Get,
	HttpCode,
	Param,
	ParseFilePipe,
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
import { UpdateUserDto } from './user.dto'
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
	async create(@Body() dto: UpdateUserDto) {
		return this.userService.create(dto)
	}

	@Put(':id')
	@Auth()
	@HttpCode(200)
	@UsePipes(new ValidationPipe())
	@UseInterceptors(new NotFoundInterceptor('Пользователь не найден'))
	@UseInterceptors(
		FileInterceptor('avatar', {
			storage: diskStorage({
				destination: (req, _, cb) => {
					const uploadPath = './uploads/'

					if (!existsSync(uploadPath)) {
						mkdirSync(uploadPath)
					}

					if (!existsSync(`${uploadPath}/${req.params.id}`)) {
						mkdirSync(`${uploadPath}/${req.params.id}`)
					}

					cb(null, uploadPath)
				},
				filename: (req, file, cb) => {
					cb(null, `${req.params.id}/avatar.${file.originalname.split('.')[1]}`)
				},
			}),
		}),
	)
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateUserDto,
		@UploadedFile(
			new ParseFilePipe({
				validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
				fileIsRequired: false,
			}),
		)
		avatar?: Express.Multer.File,
	) {
		const fileExtension = avatar?.originalname.split('.')[1]

		return this.userService.update(id, dto, fileExtension)
	}

	@Delete(':id')
	@Auth()
	@UseInterceptors(new NotFoundInterceptor('Пользователь не найден'))
	async delete(@Param('id') id: string) {
		return this.userService.delete(id)
	}
}
