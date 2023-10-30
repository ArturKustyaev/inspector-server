import { Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel, UserService } from 'src/user'
import { CreateTaskDto } from './task.dto'
import { GetTasksRequest } from './task.interface'
import { TaskModel } from './task.model'

@Injectable()
export class TaskService {
	constructor(
		@InjectModel(TaskModel) private readonly taskModel: ModelType<TaskModel>,
		private readonly userService: UserService,
	) {}

	async getAll(user: UserModel, { page, limit, query }: GetTasksRequest) {
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

	async delete(id: string) {
		return await this.taskModel.findByIdAndDelete(id)
	}
}
