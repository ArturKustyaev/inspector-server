import { BadRequestException, Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { genSalt, hash } from 'bcryptjs'
import { InjectModel } from 'nestjs-typegoose'
import { UpdateUserDto } from './user.dto'
import { GetUsersRequest } from './user.interface'
import { UserModel } from './user.model'

@Injectable()
export class UserService {
	constructor(@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>) {}

	async getAll({ page = 1, limit = 30, query = '' }: GetUsersRequest) {
		const skip = (page - 1) * limit

		const queryParams = [
			{ firstName: { $regex: query, $options: 'i' } },
			{ lastName: { $regex: query, $options: 'i' } },
			{ middleName: { $regex: query, $options: 'i' } },
			{ login: { $regex: query, $options: 'i' } },
		]

		const users = await this.userModel
			.find({
				$or: queryParams,
			})
			.select('-__v -createdAt -password -updatedAt')
			.skip(skip)
			.limit(limit)

		const total = await this.userModel.countDocuments({ $or: queryParams }).exec()

		return {
			data: users,
			total,
		}
	}

	async getById(id: string) {
		const user = await this.userModel.findOne({ _id: id })

		return this.getPublicUserFields(user)
	}

	async create(dto: UpdateUserDto) {
		const oldUser = await this.userModel.findOne({ login: dto.login })

		if (oldUser) {
			throw new BadRequestException('Пользователь с таким логином уже существует')
		}

		const salt = await genSalt(10)

		const newUser = new this.userModel({
			email: dto.email,
			firstName: dto.firstName,
			lastName: dto.lastName,
			middleName: dto.middleName,
			login: dto.login,
			password: await hash(dto.password, salt),
			role: dto.role,
		})

		await newUser.save()

		return this.getPublicUserFields(newUser)
	}

	async update(id: string, dto: UpdateUserDto, avatarExt: string | undefined) {
		const oldUser = await this.userModel.findOne({ login: dto.login })

		if (oldUser && oldUser._id.toString() !== id) {
			throw new BadRequestException('Пользователь с таким логином уже существует')
		}

		const salt = await genSalt(10)

		const avatar = (await this.userModel.findById(id)).avatar

		const updatedUser = await this.userModel.findByIdAndUpdate(
			id,
			{
				$set: {
					...dto,
					...(dto.password && { password: await hash(dto.password, salt) }),
					avatar: avatarExt ? `http://localhost:8000/${id}/avatar.${avatarExt}` : avatar ?? null,
				},
			},
			{ new: true },
		)

		return this.getPublicUserFields(updatedUser)
	}

	async delete(id: string) {
		return await this.userModel.findByIdAndDelete(id)
	}

	getPublicUserFields(user: UserModel) {
		if (!user) return

		return {
			_id: user._id,
			lastName: user.lastName,
			firstName: user.firstName,
			middleName: user.middleName,
			email: user.email,
			login: user.login,
			role: user.role,
			avatar: user.avatar,
		}
	}
}
