import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
//import { FileInterceptor } from '@nestjs/platform-express';
//importaremos los estados y las ciudades de mexico desde el archivo dataCities.ts
import { states, cities } from '../lib/dataCities';
import { AppService } from 'src/app.service';



const listCountrys = ['México'];

@Injectable()
export class AuthService {
   userRolesIds = [];



  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
  ) {
    this.userRolesIds = [...this.appService.listRoles];
  }

  async validateUser(email: string, password: string): Promise<any> {
    //console.log('Buscando email:...', email);
    //console.log('checando password:...', password);
    const user = await this.userModel.findOne({ email });
    //console.log('user validateUser auth.service:...', user);
    const isValidPassword = await bcrypt.compare(
      password,
      user?.password || '',
    );
    //console.log('isValidPassword:...',String(isValidPassword));
    if (user !== null && isValidPassword === true) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  
  async register(
    createUserDto: CreateUserDto
  ): Promise<any> {
    const { password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    await newUser.save();
    const user = newUser.toObject();
    const { password: pwd, _id, ...restUser } = user;
    const payload = { email: user.email, userId: String(user._id), userRoles: user.userRoles };
    const access_token = this.jwtService.sign(payload);    
    return {
      ...restUser,
      access_token,
    }
  }

  async login(user: any) {
    const payload = { email: user.email, userId: String(user._id), userRoles: user.userRoles };
    //console.log('payload(login):...',payload);
    const { password,_id, ...restUser } = user;
    return {
      ...restUser,
      access_token: this.jwtService.sign(payload),
    };
  }

  validateDataUser(user: CreateUserDto): object {
    const {
      userRoles,
      roleId,
      businessName,
      email,
      password,
      phone,
      city,
      state,
      country,
      postalCode,
    } = user;
    const isValidDataUser = {
      resultValidations: true,
      message: '',
    };
    //primero checar que todos los campos requeridos esten presentes
    if (
      !userRoles ||
      !roleId ||
      !businessName ||
      !email ||
      !password ||
      !country 
    ) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Missing required fields';
      return isValidDataUser;
    }
    

    //checar que el email sea valido
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid email';
      return isValidDataUser;
    }
    //checar que el password sea valido
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-!+?@¿,:#._%/&$*¡])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message =
        'Invalid password, Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and one special case Character -!+?@¿,:#._%/&$*¡';
      return isValidDataUser;
    }
    //checar que el telefono sea valido
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid phone';
      return isValidDataUser;
    }
    //checar que el codigo postal sea valido
    const postalCodeRegex = /^\d{5}$/;
    if (!postalCodeRegex.test(postalCode)) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid postal code';
      return isValidDataUser;
    }
    //checar que el userRoles sea un arreglo de strings
    if (
      !Array.isArray(userRoles) ||
      userRoles.some((role) => typeof role !== 'string')
    ) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid user roles';
      return isValidDataUser;
    }
    //checar que el roleId sea un string y que sea un valor valido de userRolesIds
    if (
      typeof roleId !== 'string' ||
      !Object.values(this.userRolesIds).includes(roleId)
    ) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid role id';
      return isValidDataUser;
    }
    //checar que el country sea un string y que sea un valor valido en listCountrys
    if (typeof country !== 'string' || !listCountrys.includes(country)) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid country';
      return isValidDataUser;
    }
    //checar que el state sea un string y que sea un valor valido en states
    if (typeof state !== 'string' || !states.includes(state)) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid state';
      return isValidDataUser;
    }
    //checar que el city sea un string y que sea un valor valido en cities del estado correspondiente
    //primero obtenemos el indice del estado en el arreglo de estados
    const indexState = states.indexOf(state);
    if (typeof city !== 'string' || !cities[indexState].includes(city)) {
      isValidDataUser.resultValidations = false;
      isValidDataUser.message = 'Invalid city';
      return isValidDataUser;
    }

    return isValidDataUser;
  }
}
