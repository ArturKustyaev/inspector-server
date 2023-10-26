import { applyDecorators, UseGuards } from '@nestjs/common'
import { AuthRole } from './auth.interface'
import { IsAdmin } from './guards/admin.guard'
import { JwtAuthGuard } from './guards/jwt.guard'

export const Auth = (role: AuthRole = 'user') =>
	applyDecorators(role === 'admin' ? UseGuards(JwtAuthGuard, IsAdmin) : UseGuards(JwtAuthGuard))
