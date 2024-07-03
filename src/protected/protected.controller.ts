import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthorizationGuard } from '../authorization/authorization.guard';
import { Roles } from '../authorization/roles.decorator';

@Controller('protected')
export class ProtectedController {
  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('businessOwner')
  @Get()
  getProtectedResource() {
    return { message: 'This is a protected resource' };
  }
}
