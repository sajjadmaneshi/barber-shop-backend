import { ClassSerializerInterceptor, Global, Logger, Module, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

import ormConfig from './config/orm.config';

import ormConfigProd from './config/orm.config.prod';
import { InitializeService } from './common/services/initial-app.service';
import { UserRoleEntity } from './data/entities/user-role.entity';
import { DocumentModule } from './modules/document.module';
import { GeoLocationModule } from './modules/geo-location.module';
import { BarberModule } from './modules/barber.module';
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AllExceptionsFilter } from './common/filters/error.filter';
import { ServiceModule } from './modules/service.module';
import { BarberServiceModule } from './modules/barber-service.module';

import { CalendarModule } from './modules/calendar.module';
import { ExceptionDayModule } from './modules/exception-day.module';
import { TimeSlotModule } from './modules/time-slot.module';
import { ReserveModule } from './modules/reserve.module';
import { AccountModule } from './modules/account.module';
import { FilterPaginationService } from "./services/pagination-filter.service";

@Global()
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
    } as TypeOrmModuleAsyncOptions),
    TypeOrmModule.forFeature([UserRoleEntity]),
    AccountModule,
    DocumentModule,
    GeoLocationModule,
    BarberModule,
    ServiceModule,
    BarberServiceModule,
    CalendarModule,
    ExceptionDayModule,
    TimeSlotModule,
    ReserveModule,
  ],
  controllers: [],
  providers: [
    InitializeService,
    FilterPaginationService,

    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  exports:[FilterPaginationService]
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
