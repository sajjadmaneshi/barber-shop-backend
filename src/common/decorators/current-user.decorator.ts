import { createParamDecorator, ExecutionContext } from '@nestjs/common';
//data ==> for passing some data to decorator if you want;
//ctx ==> get some context information of request
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user ?? null;
  },
);
