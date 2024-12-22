export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  commitPartial(): Promise<void>;
  complete(): Promise<void>;
}
