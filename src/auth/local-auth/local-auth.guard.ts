import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//import { LocalStrategy } from '../local.strategy/local.strategy';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    //console.log('LocalAuthGuard:... Before authentication');
    const result = (await super.canActivate(context)) as boolean;
    //console.log('LocalAuthGuard:... After authentication');
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: any) {
    //console.log('LocalAuthGuard(handleRequest info):...', info);
    //console.log('LocalAuthGuard(handleRequest user):...', user);
    //console.log('LocalAuthGuard(handleRequest err):...', err);
    //console.log('LocalAuthGuard(handleRequest context):...', context);
    //console.log('LocalAuthGuard(handleRequest context.body):...', context.body);
    // extract the request object from the context
    const request = context.switchToHttp().getRequest();
    // extract the data body from the request object
    const data = request.body;
    //console.log('LocalAuthGuard(handleRequest data):...', data);
    if (!data.email || !data.password) {
      throw new UnauthorizedException('missing credentials');
    }

    //verificar si user es un UnauthorizedException retornar el response de la misma
    if (user instanceof UnauthorizedException) {
      //extraer el response de la excepción
      //const response = user.getResponse();
      //console.log('local-auth(handleRequest response):...', response);
      throw user;
    }

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
