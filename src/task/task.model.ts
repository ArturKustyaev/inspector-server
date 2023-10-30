import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export interface TaskModel extends Base {}

export class TaskModel extends TimeStamps {
	@prop()
	userId: string

	@prop()
	title: string

	@prop()
	description: string
}
