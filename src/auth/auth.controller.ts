import { 
  Controller, Post, Body, Request, UseGuards, 
  UnauthorizedException, UseInterceptors, UploadedFile, ParseFilePipeBuilder, 
  HttpException,
  HttpStatus} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/users/users.service';
import { uploadOneFileToBucket } from 'src/lib/awsLib';
import { AppService } from 'src/app.service';



//const bcrypt_saltRounds = process.env.BCRYPT_SALT || 10;
//const AWS_BUCKETNAME = process.env.AWS_BUCKETNAME || 'bucketname';
//const JWT_SECRET = process.env.JWT_SECRET || 'jwtsecret';

@Controller('auth')
export class AuthController {
  dataEnv: any;
  constructor(
    // eslint-disable-next-line prettier/prettier
    private authService: AuthService,
    private userService: UsersService,
    private jwtService: JwtService,
    private appService: AppService,
  ) {
    this.dataEnv = this.appService.getDataEnv();
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    const { user } = req;
    //verificar si user es un UnauthorizedException retornar el response de la misma
    if (user instanceof UnauthorizedException) {
      //extraer el response de la excepción
        const response = user.getResponse();
        console.log('auth.controller(login response):...', response);
      return user;
    }
    //console.log('req.user:...', req.user);
    return this.authService.login(user);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /\/(jpg|jpeg|png)$/,
        })
        .build(
          {
            exceptionFactory: (errors) => new HttpException(errors, HttpStatus.BAD_REQUEST),
            fileIsRequired: false,  // Esta línea hace que el archivo sea opcional
          }
        ),
    )
    file?: Express.Multer.File,
  ) {

    //como primer paso asignaremos el userStatus a 'active'
    createUserDto.userStatus = 'active';

    //console.log('createUserDto(creando User):...', createUserDto);
    //si el userRoles es un string lo convertimos en un array
    if(typeof createUserDto.userRoles === 'string'){
       const tempUserRoles = JSON.parse(createUserDto.userRoles);
        createUserDto.userRoles = tempUserRoles;
    }
    //si el branch es un string lo convertimos en un array
    if(typeof createUserDto.branch === 'string'){
      const tempBranch = JSON.parse(createUserDto.branch);
       createUserDto.branch = tempBranch;
    }
    console.log('createUserDto(parsed Data):...', createUserDto);

    
    //agregar el roleId a userRoles
    if(createUserDto.roleId&&createUserDto.roleId!==''&&createUserDto.roleId!==null){
    const rolesArray = createUserDto.userRoles || []; 
    createUserDto.userRoles = [...rolesArray, createUserDto.roleId];
    }

    if(!createUserDto.roleId && createUserDto.userRoles.length>0){
      createUserDto.roleId = createUserDto.userRoles[0];
    }

    //console.log('createUserDto(nuevos datos):...', createUserDto);
    
    //si el usuario es un cliente entonces el campo businessOwner debe contener el email del businessOwner
    if(createUserDto.businessOwner&&createUserDto.businessOwner!==''){
      //en este caso consultaremos el id del businessOwner a partir del email
      const dataUser:any = await this.userService.findOneByEmail(createUserDto.businessOwner);
      const idBusinessOwner = String(dataUser._id);
      createUserDto.businessOwner = idBusinessOwner;
    }
    //console.log('roleId:...', createUserDto.roleId);  
    //console.log('createUserDto(agregando roleId):...', createUserDto);
    // primero haremos las validaciones necesarias si el roleId es businessOwner
    if(createUserDto.roleId==='businessOwner'){
    const isValidDataUser:any = this.authService.validateDataUser(createUserDto);
    if (isValidDataUser.resultValidations === false) {

      return { isValidDataUser, dataUser: createUserDto };
    }
  }
    //ahora creamos el usuario
    const bcrypt_saltRounds = +this.dataEnv.BCRYPT_SALT || 10;
    if(createUserDto.password&&createUserDto.password!==''){
    createUserDto.password = await bcrypt.hash(createUserDto.password, bcrypt_saltRounds);
    }
    const newUserTemp:any = await this.userService.create(createUserDto);
    //console.log('newUserTemp:...', newUserTemp);
    if (newUserTemp.error) {
      return newUserTemp;
    }
    const newUser = await newUserTemp.toObject();
    //console.log('newUser (_id):...', newUser._id);
    if(file){
      const idUser = newUser._id.toString();
      //subimos la imagen al bucket
          await uploadOneFileToBucket(
           file,
           idUser,
           this.dataEnv
         );
         const AWS_BUCKETNAME = this.dataEnv.AWS_BUCKETNAME;
         createUserDto.imageUrl=`https://${AWS_BUCKETNAME}.s3.us-east-2.amazonaws.com/${idUser}/${file.originalname}`;
  
         //actualizamos el user con la url de la imagen
         await this.userService.update(idUser, createUserDto);
  
    }
    
        //le crearemos un token
        const payload = { email: newUser.email, userId: String(newUser._id), userRoles: newUser.userRoles };
        const token = this.jwtService.sign(payload);
        const { password,_id, ...restUser } = newUser;
        return { access_token:token, ...restUser, imageUrl: createUserDto.imageUrl};


    //const user = await this.authService.register(createUserDto);
    //return user;
  }

  @Post('update-password')
  async updatePassword(@Body() data: any) {
    const { email, password } = data;
    //console.log('data (updatePassword):...', data);
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.userService.updatePassword(email, hashedPassword);
  }


}
