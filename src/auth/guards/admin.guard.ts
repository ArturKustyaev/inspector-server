import { CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserModel } from 'src/user'

export class IsAdmin implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<{ user: UserModel }>()

		const user = request.user

		if (user.role !== 'admin') {
			throw new ForbiddenException('У вас недостаточно прав')
		}

		return true
	}
}
