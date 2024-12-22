// src/unit-of-work/unit-of-work.ts
import { Injectable } from '@nestjs/common';
import { QueryRunner, Repository } from 'typeorm';
import { IUnitOfWork } from '../interfaces/unit-of-work.interface';


@Injectable()
export class UnitOfWork implements IUnitOfWork {
  get repository(): Repository<any> {
    return this._repository;
  }

  set repository(value: Repository<any>) {
    this._repository = value;
  }
  private queryRunner: QueryRunner;
  private _repository: Repository<any>;

  constructor() {}

  async begin(): Promise<void> {
    this.queryRunner = this.repository.manager.connection.createQueryRunner();
    await this.queryRunner.connect();
    await this.queryRunner.startTransaction();
  }

  async commit(): Promise<void> {
    try {
      await this.queryRunner.commitTransaction();
    } finally {
      await this.queryRunner.release();
    }
  }

  async rollback(): Promise<void> {
    try {
      await this.queryRunner.rollbackTransaction();
    } finally {
      await this.queryRunner.release();
    }
  }

  async commitPartial(): Promise<void> {
    await this.queryRunner.commitTransaction();
    await this.queryRunner.startTransaction();
  }

  async complete(): Promise<void> {
    try {
      await this.commit();
    } catch (err) {
      await this.rollback();
      throw err;
    }
  }
  async save(entity: any, dto: any) {
    await this.queryRunner.manager.save(entity, dto);
  }

  getQueryRunner(): QueryRunner {
    return this.queryRunner;
  }
}
