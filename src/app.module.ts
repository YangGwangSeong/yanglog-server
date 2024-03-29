import {
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from '@nestjs/config';
import emailConfig from './config/emailConfig';
import { validationSchema } from './config/validationSchema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './config/typeorm.config';
import { LoggerMiddleware } from './logger/logger.middleware';
import { UsersController } from './users/users.controller';
import { PostsModule } from './posts/posts.module';
import authConfig from './config/authConfig';
import {
	utilities as nestWinstonModuleUtilities,
	WinstonModule,
} from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { ManageModule } from './manage/manage.module';
import { CommentsModule } from './comments/comments.module';
import { SearchService } from './search/search.service';
import { NotificationsModule } from './notifications/notifications.module';
import * as winston from 'winston';

@Module({
	imports: [
		TypeOrmModule.forRoot(typeORMConfig),
		ConfigModule.forRoot({
			envFilePath: [`${__dirname}/../.${process.env.NODE_ENV}.env`],
			load: [emailConfig, authConfig],
			isGlobal: true,
			validationSchema,
		}),
		WinstonModule.forRoot({
			transports: [
				new winston.transports.Console({
					level: process.env.NODE_ENV === 'production' ? 'info' : 'silly',
					format: winston.format.combine(
						winston.format.timestamp(),
						nestWinstonModuleUtilities.format.nestLike('MyApp', {
							prettyPrint: true,
						}),
					),
				}),
			],
		}),
		UsersModule,
		PostsModule,
		AuthModule,
		ManageModule,
		CommentsModule,
		NotificationsModule,
	],
	controllers: [],
	providers: [SearchService],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer): any {
		consumer
			.apply(LoggerMiddleware)
			.exclude({ path: 'users', method: RequestMethod.GET }) //exclude함수는 미들웨어를 적용하지 않을 라우팅 경로를 설정. ex) /users GET 요청은 적용x
			.forRoutes(UsersController); //'/users'
	}
}
