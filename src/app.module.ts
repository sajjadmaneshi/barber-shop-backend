import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import ormConfig from './config/orm.config';

import { UserModule } from './modules/user.module';
import ormConfigProd from './config/orm.config.prod';
import { AuthModule } from './modules/auth.module';
import { InitializeService } from './common/initial-app.service';
import { UserRole } from './data/entities/user-role.entity';
import { DocumentModule } from './modules/document.module';
import { GeoLocationModule } from './modules/geo-location.module';
import { BarberModule } from './modules/barber.module';
import { ServiceModule } from './modules/service.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory:
        process.env.NODE_ENV !== 'production' ? ormConfig : ormConfigProd,
    }),
    TypeOrmModule.forFeature([UserRole]),
    UserModule,
    AuthModule,
    DocumentModule,
    GeoLocationModule,
    BarberModule,
    ServiceModule,
  ],
  controllers: [],
  providers: [InitializeService],
})
export class AppModule implements OnApplicationBootstrap {
  logger = new Logger();
  constructor(private readonly _initialAppService: InitializeService) {
    this.logger.debug(process.env.NODE_ENV);
  }
  async onApplicationBootstrap(): Promise<void> {
    await this._initialAppService.initializeRoles();
  }
}
