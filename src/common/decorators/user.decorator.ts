import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    if (!req) return undefined;
    const user = req.user;
    if (!user) return undefined;
    return data ? user[data] : user;
  },
);
