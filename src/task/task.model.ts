import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { TaskStatus, ViolationUser } from './task.interface'

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

export class TaskModel extends TimeStamps {
	@prop()
	violationInfo: ViolationInfoModel

	@prop()
	courtInfo: ViolationCourtModel
}
