import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { getMongoDBConfig } from './config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { TaskModule } from './task/task.module'
import { ServeStaticModule } from '@nestjs/serve-static/dist/serve-static.module'
import { join } from 'path'

@Module({
	imports: [
		ConfigModule.forRoot(),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'uploads'),
		}),
		TypegooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getMongoDBConfig,
		}),
		AuthModule,
		UserModule,
		TaskModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
