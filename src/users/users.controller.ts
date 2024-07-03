import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpException,
  HttpStatus,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
//import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { FileInterceptor } from '@nestjs/platform-express';
//import { uploadOneFileToBucket } from 'src/lib/awsLib';
import { Roles } from 'src/authorization/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthorizationGuard } from 'src/authorization/authorization.guard';
import { JwtService } from '@nestjs/jwt';
import { AppService } from 'src/app.service';
import { uploadOneFileToBucket } from 'src/lib/awsLib';

@Controller('users')
export class UsersController {
  dataEnv: any;
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
  ) {
    this.dataEnv = this.appService.getDataEnv();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('')
  async findAll(
    @Query('role') role: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any> {
    //console.log('role:...', role);
    //console.log('page:...', page);
    //console.log('limit:...', limit);
    const result = await this.usersService.findAll(role, page, limit);
    return result;
  }

  @Get('/employees/:emailBusinessOwner')
  async findEmployees(@Param('emailBusinessOwner') emailBusinessOwner: string): Promise<any> {
    //console.log('emailBusinessOwner:...', emailBusinessOwner);
    return this.usersService.findEmployees(emailBusinessOwner);
  }

  @Post('/employees/filter')
  async filterEmployees(@Body() dataFilter: any): Promise<any> {
    //console.log('dataFilter:...', dataFilter);
    return this.usersService.filterEmployees(dataFilter);
  }

    

  @Get('/profile/:email')
  findOne(@Param('email') email: string) {
    return this.usersService.findOne(email);
  }

  @Get('/dataBusinessOwner/:id')
  getDataBusinessOwner(@Param('id') id: string) {
    //console.log('getDataBusinessOwner(id):...', id);
    return this.usersService.getDataBusinessOwner(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('businessOwner','branch','adminRoot')
  @UseInterceptors(FileInterceptor('file'))
  @Post('edit-profile')
  async editProfile(
    @Req() req: any,
    @Query('idUser') idUser: string,
    @Body() dataUser: any,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /\/(jpg|jpeg|png)$/,
        })
        .build({
          exceptionFactory: (errors) =>
            new HttpException(errors, HttpStatus.BAD_REQUEST),
          fileIsRequired: false, // Esta línea hace que el archivo sea opcional
        }),
    )
    file?: Express.Multer.File,
  ) {
    //console.log('editProfile data:...', data);
    //console.log('editProfile file:...', file);
    //recuperar el id del usuario autenticado desde el token jwt que se encuentra en la cabecera de la solicitud
    let editUserId: string;
    const token: any = req.headers.authorization.split(' ')[1];
    if(!idUser){
      const { userId } = this.jwtService.decode(token);
      editUserId = userId;
    }else{
      editUserId = idUser;
    }
    //verificar si el businessOwner viene en un formato de email 
    //se debera buscar el id del businessOwner a partir del email
    //y asignar el id del businessOwner al campo businessOwner
    const regexEmail = /\S+@\S+\.\S+/;
    if (dataUser.businessOwner && regexEmail.test(dataUser.businessOwner)) {
      const dataUserBusinessOwner: any = await this.usersService.findOneByEmail(
        dataUser.businessOwner,
      );
      dataUser.businessOwner = String(dataUserBusinessOwner._id);
    }

    
    //console.log('editProfile payload:...', payload);
    if (file) {
      console.log('editProfile file:...', file);
      //actualizar la imagen de perfil
      const resultUpload = await uploadOneFileToBucket(
        file,
        editUserId,
        this.dataEnv,
      );
      console.log('editProfile resultUpload:...', resultUpload);
      dataUser.imageUrl = `https://${this.dataEnv.AWS_BUCKETNAME}.s3.us-east-2.amazonaws.com/${editUserId}/${file.originalname}`;
    }
    //se deben parsear el dato userRoles y branch a un array
    if (typeof dataUser.userRoles === 'string') {
      const tempUserRoles = JSON.parse(dataUser.userRoles);
      dataUser.userRoles = tempUserRoles;
    }
    //si el branch es un string lo convertimos en un array
    if (typeof dataUser.branch === 'string') {
      const tempBranch = JSON.parse(dataUser.branch);
      dataUser.branch = tempBranch;
    }
    //verificar si el usuario esta actualizando su contraseña
    if (dataUser.password && dataUser.password !== '') {
      //encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(dataUser.password, salt);
      dataUser.password = hashedPassword;
    }
    //actualizar los datos del usuario
    const resUpdate: any = await this.usersService.update(editUserId, dataUser);
    return {
      ...resUpdate._doc,
      access_token: token,
      imageUrl: dataUser.imageUrl,
    };
  }


  @Get('branchesCategories/:emailBusinessOwner')
  async getBranchesCategories(@Param('emailBusinessOwner') emailBusinessOwner: string): Promise<any>{
    //console.log('emailUser(searchCategories):...', email);
    return this.usersService.getBranchesCategories(emailBusinessOwner);
  }

  @Post('branchesFilter')
  async filterBranches(@Body() dataFilter: any): Promise<any>{
    //console.log('dataFilter:...', dataFilter);
    return this.usersService.filterBranches(dataFilter);
  }

  @Get('branches/:emailBusinessOwner')
  async getBranches(
    @Param('emailBusinessOwner') emailBusinessOwner: string,
    @Query('query') query: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<any>{
    //console.log('emailUser(searchCategories):...', email);
    //console.log('query:...', query);
    //console.log('page:...', page);
    //console.log('limit:...', limit);
    //console.log('emailBusinessOwner:...', emailBusinessOwner);
    const dataMail = emailBusinessOwner.trim();
    return this.usersService.getBranches(dataMail, query, page, limit);
  }

  //crearemos una ruta temporal


}
