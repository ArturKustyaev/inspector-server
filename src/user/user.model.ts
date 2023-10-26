import { prop } from '@typegoose/typegoose'
import { TimeStamps, Base } from '@typegoose/typegoose/lib/defaultClasses'
import mongoose from 'mongoose'

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
	@prop({ enum: ['user', 'admin', 'supervisor', 'lawyer'], default: 'user' })
	role: string
}
