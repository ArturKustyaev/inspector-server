import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export interface UserModel extends Base {}

export class UserModel extends TimeStamps {
	@prop()
	lastName: string
	@prop()
	firstName: string
	@prop()
	middleName: string
	@prop({ unique: true })
	login: string
	@prop()
	password: string

	@prop()
	email: string

	@prop({ enum: ['user', 'admin', 'supervisor', 'lawyer'], default: 'user' })
	role: string

	@prop()
	avatar: string | null
}
