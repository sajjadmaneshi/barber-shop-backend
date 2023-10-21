import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './controllers/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5400,
      username: 'postgres',
      password: 'sajjad1234',
      database: 'postgres',
      entities: [User],
      synchronize: true, // Be careful with this in production!
    }),
    TypeOrmModule.forFeature([Event]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
