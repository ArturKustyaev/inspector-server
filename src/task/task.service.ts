import { BadRequestException, Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel } from 'src/user'
import { ChangeStatusDto, CreateTaskDto, UpdateCourtDto, UpdateReviewsDto, UpdateTaskDto } from './task.dto'
import { GetTasksRequest, ReviewStatus, TaskStatus, ViolationUser } from './task.interface'
import { TaskModel, ViolationCourtModel, ViolationInfoModel } from './task.model'

@Injectable()
export class TaskService {
	constructor(
		@InjectModel(TaskModel) private readonly taskModel: ModelType<TaskModel>,
		@InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
	) {}

	async getAll(user: UserModel, { page = 1, limit = 30, query = '' }: GetTasksRequest) {
		const skip = (page - 1) * limit

		const findOptions = {
			$or: [{ 'violationInfo.title': { $regex: query, $options: 'i' } }],
			$and: [
				user.role === 'admin' || user.role === 'lawyer' || user.role === 'supervisor'
					? {}
					: { 'violationInfo.user._id': user._id },
			],
			'violationInfo.status': {
				$in:
					user.role === 'lawyer'
						? [TaskStatus.coordination, TaskStatus.court]
						: [
								TaskStatus.completed,
								TaskStatus.coordination,
								TaskStatus.court,
								TaskStatus.created,
								TaskStatus.revision,
						  ],
			},
		}

		const tasks = await this.taskModel.find(findOptions).select('-__v').skip(skip).limit(limit)
		const total = await this.taskModel.countDocuments(findOptions).exec()

		return {
			data: tasks,
			total,
		}
	}

	async getById(id: string) {
		const task = await this.taskModel.findOne({ _id: id })

		return task
	}

	async create(userId: string, dto: CreateTaskDto) {
		const user = await this.userModel.findById(userId)
		const { _id, lastName, firstName, middleName } = user

		const violationUser: ViolationUser = {
			_id,
			lastName,
			firstName,
			middleName,
		}

		const violationInfo: ViolationInfoModel = {
			title: dto.title,
			status: TaskStatus.created,
			discoveryDate: dto.discoveryDate ?? null,
			description: dto.description ?? null,
			district: dto.district ?? null,
			location: dto.location ?? null,
			user: violationUser,
			violationType: dto.violationType ?? null,
		}

		const courtInfo: ViolationCourtModel = {
			amount: null,
			courtDecision: null,
			endDate: null,
		}

		const newTask = await this.taskModel.create({
			violationInfo,
			courtInfo,
		})

		return newTask
	}

	async update(dto: UpdateTaskDto) {
		const violationInfo = {
			'violationInfo.title': dto.title,
			'violationInfo.description': dto.description,
			'violationInfo.discoveryDate': dto.discoveryDate,
			'violationInfo.district': dto.district,
			'violationInfo.location': dto.location,
			'violationInfo.violationType': dto.violationType,
		}

		const updatedViolation = await this.taskModel.findByIdAndUpdate(
			dto.violationId,
			{
				$set: { ...violationInfo },
			},
			{ new: true },
		)

		return updatedViolation
	}

	async delete(user: UserModel, id: string) {
		const task = await this.getById(id)

		if (!task) return

		if (task.violationInfo.user._id.toString() !== user._id.toString() && user.role !== 'admin') {
			throw new BadRequestException('Вы не можете удалить чужую запись о нарушении')
		}

		await this.taskModel.deleteOne({ _id: id }).exec()

		return task
	}

	async changeStatus(dto: ChangeStatusDto) {
		const task = await this.taskModel.findByIdAndUpdate(
			dto.id,
			{
				$set: {
					'violationInfo.status': dto.status,
				},
			},
			{ new: true },
		)

		return task
	}

	async approveViolation(userId: string, dto: UpdateReviewsDto) {
		const user = await this.userModel.findById(userId)

		const userInitials = `${user.lastName} ${user.firstName[0]}.${user.middleName[0]}.`

		const violation = await this.taskModel.findByIdAndUpdate(
			dto.id,
			{
				$set: {
					'violationInfo.status': dto.status === ReviewStatus.approve ? 'court' : 'revision',
				},
				$push: {
					review: {
						user: userInitials,
						status: dto.status,
						date: dto.date,
						message: dto.message ?? null,
					},
				},
			},
			{ new: true },
		)

		return violation
	}

	async updateCourtInfo(dto: UpdateCourtDto) {
		const courtInfo = {
			'courtInfo.endDate': dto.endDate,
			'courtInfo.courtDecision': dto.courtDecision,
			'courtInfo.amount': dto.amount,
		}

		const task = await this.taskModel.findByIdAndUpdate(
			dto.violationId,
			{ $set: { ...courtInfo, 'violationInfo.status': 'completed' } },
			{ new: true },
		)

		return task
	}
}
