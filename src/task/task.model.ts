import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { ReviewStatus, TaskStatus, ViolationUser } from './task.interface'

export interface TaskModel extends Base {}

export interface ViolationInfoModel {
	status: TaskStatus
	user: ViolationUser
	title: string
	discoveryDate: string
	violationType: string
	district: string
	location: string
	description: string
}

export interface ViolationCourtModel {
	endDate: string
	courtDecision: string
	amount: number
}

export interface ViolationReview {
	user: string
	status: ReviewStatus
	date: string
	message: string | null
}

export class TaskModel extends TimeStamps {
	@prop()
	violationInfo: ViolationInfoModel

	@prop()
	courtInfo: ViolationCourtModel

	@prop()
	review: ViolationReview[]
}
