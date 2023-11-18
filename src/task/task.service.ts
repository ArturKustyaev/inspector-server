import { BadRequestException, Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel, UserService } from 'src/user'
import { CreateTaskDto } from './task.dto'
import { GetTasksRequest } from './task.interface'
import { TaskModel } from './task.model'

@Injectable()
export class TaskService {
	constructor(@InjectModel(TaskModel) private readonly taskModel: ModelType<TaskModel>) {}

	async getAll(user: UserModel, { page = 1, limit = 30, query = '' }: GetTasksRequest) {
		const skip = (page - 1) * limit

		const tasks = await this.taskModel
			.find({
				$or: [{ title: { $regex: query, $options: 'i' } }],
				$and: [user.role === 'admin' ? {} : { userId: user._id }],
			})
			.select('-__v')
			.skip(skip)
			.limit(limit)

		const total = await this.taskModel
			.countDocuments({
				$or: [{ title: { $regex: query, $options: 'i' } }],
				$and: [user.role === 'admin' ? {} : { userId: user._id }],
			})
			.exec()

		return {
			data: tasks,
			total,
		}
	}

	async getById(id: string) {
		const task = await this.taskModel.findOne({ _id: id })

		return task
	}

	async create(dto: CreateTaskDto) {
		const newTask = await this.taskModel.create(dto)

		return newTask
	}

	async update() {}

	async delete(user: UserModel, id: string) {
		const task = await this.getById(id)

		if (!task) return

		if (task.userId !== user._id.toString() && user.role !== 'admin') {
			throw new BadRequestException('Вы не можете удалить чужое задание')
		}

		await this.taskModel.deleteOne({ _id: id }).exec()

		return task
	}
}
