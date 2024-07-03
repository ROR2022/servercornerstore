import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthorizationService } from './authorization.service';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    // eslint-disable-next-line prettier/prettier
    private reflector: Reflector,
    private authorizationService: AuthorizationService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    //console.log('authorization.guard roles:...',roles);
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    //console.log('authorization.guard user:...',user);
    //extraemos el token del header de la petición
    //const token = request.headers.authorization.split(' ')[1];
    //console.log('authorization.guard token:...',token);
    
    return this.authorizationService.validateUserRole(user.userId, roles);
  }
}
