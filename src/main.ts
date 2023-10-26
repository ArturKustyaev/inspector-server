import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule, { cors: true })
	app.setGlobalPrefix('api')

	const config = new DocumentBuilder()
		.setTitle('inspectors')
		.setDescription('The inspectors API description')
		.setVersion('1.0')
		.addTag('inspectors')
		.build()

	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api', app, document)

	await app.listen(8000)
}
bootstrap()
