// packages/shared/src/auth/interfaces/jwt-strategy.interface.ts
export interface IJwtStrategy {
  validate(payload: any): Promise<any>;
}
