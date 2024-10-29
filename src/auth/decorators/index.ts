import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { ERoles } from 'src/__shared__/enums/enum';

export const ROLES_KEY = 'roles';
export const AllowRoles = (...roles: ERoles[]) => SetMetadata(ROLES_KEY, roles);

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): any => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
