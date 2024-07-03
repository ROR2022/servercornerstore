import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import { AppService } from 'src/app.service';

//import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthorizationService {
  private roles = [];

  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly appService: AppService,
  ) {
    this.roles= [...this.appService.listRoles];
  }

  

  async validateUserRole(userId: string, roles: string[]): Promise<boolean> {
    //console.log('validateUserRole userId:...',userId);
    //recuperamos los datos del usuario de la base de datos
    const dataUser:any= await this.userModel.findOne({ _id: userId});
    //console.log('authorizationservice validateUserRole dataUser:...',dataUser);
    const userRole = this.roles.find(role => role === dataUser.roleId);
    //console.log('validateUserRole userRole:...',userRole);
    if (!userRole) {
      //console.log('validateUserRole userRole:...',userRole);
      return false;
    }
    return roles.some(role => userRole===role);
  }
}

