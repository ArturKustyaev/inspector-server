import { UserModel } from 'src/user'

export interface GetTasksRequest {
	page?: number
	limit?: number
	query?: string
}

export enum TaskStatus {
	created = 'created',
	coordination = 'coordination',
	revision = 'revision',
	completed = 'completed',
}

export type ViolationUser = Pick<UserModel, '_id' | 'lastName' | 'firstName' | 'middleName'>
