import { BadRequestException, Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { genSalt, hash } from 'bcryptjs'
import { InjectModel } from 'nestjs-typegoose'
import { UpdateUserDTO } from './user.dto'
import { GetUsersRequest } from './user.interface'
import { UserModel } from './user.model'

@Injectable()
export class UserService {
	constructor(@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>) {}

	async getAll({ page = 1, limit = 2, query = '' }: GetUsersRequest) {
		const skip = (page - 1) * limit

		const users = await this.userModel
			.find({
				$or: [
					{ firstName: { $regex: query, $options: 'i' } },
					{ lastName: { $regex: query, $options: 'i' } },
					{ middleName: { $regex: query, $options: 'i' } },
					{ login: { $regex: query, $options: 'i' } },
				],
			})
			.select('-__v -password -createdAt -updatedAt')
			.skip(skip)
			.limit(limit)
		const total = await this.userModel.countDocuments().exec()

		return {
			data: users,
			total,
		}
	}

	async getById(id: string) {
		const user = await this.userModel.findOne({ _id: id })

		return this.getPublicUserFields(user)
	}

	async create(dto: UpdateUserDTO) {
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
		})

		await newUser.save()

		return this.getPublicUserFields(newUser)
	}

	async update(id: string, dto: UpdateUserDTO) {
		const oldUser = await this.userModel.findOne({ login: dto.login })

		if (oldUser && oldUser._id.toString() !== id) {
			throw new BadRequestException('Пользователь с таким логином уже существует')
		}

		const salt = await genSalt(10)
		const newPassword = await hash(dto.password, salt)

		const updatedUser = await this.userModel.findByIdAndUpdate(
			id,
			{ $set: { ...dto, password: newPassword } },
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
			login: user.login,
			lastName: user.lastName,
			firstName: user.firstName,
			middleName: user.middleName,
			role: user.role,
		}
	}
}
