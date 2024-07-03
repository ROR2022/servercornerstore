import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
//import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
//import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { PaginateModel } from 'mongoose';
import e from 'express';

@Injectable()
export class UsersService {
  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(User.name) private userModel: PaginateModel<UserDocument>,
    private readonly jwtService: JwtService,
    // private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    try {
      const newUser = new this.userModel(createUserDto);
      const result = await newUser.save();
      return result;
    } catch (error) {
      //console.log('error:...', error.message);
      //throw error;
      return { error: error.message };
    }

    //return 'This action adds a new user';
  }

  async findAll(
    role: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const options = {
      page,
      limit,
      lean: true, // devuelve objetos JavaScript normales en lugar de documentos de Mongoose
    };

    const query = { roleId: role };

    const result = await this.userModel.paginate(query, options);
    return result;
  }

  async findOne(email: string): Promise<any> {
    const dataUser: any = await this.userModel.findOne({ email });
    //console.log('dataUser:...', dataUser);
    if (!dataUser) return { error: 'User not found' };
    const { password, _id, ...restUser } = dataUser?._doc;
    return restUser;
  }

  async findOneByEmail(email: string): Promise<any> {
    //console.log('email(userService):...', email);
    return new Promise((resolve) => {
      this.userModel
        .findOne({ email })
        .then((dataUser: any) => {
          //console.log('dataUser(userService):...', dataUser);
          //if(!dataUser) return {error: 'User not found'};
          //const { password,_id, ...restUser } = dataUser?._doc;
          resolve(dataUser?._doc);
        })
        .catch((error: any) => {
          console.log('error(userService):...', error);
          resolve({ error: error });
        });
    });
    /* console.log('dataUser(userService):...', dataUser);
    if(!dataUser) return {error: 'User not found'};
    //const { password,_id, ...restUser } = dataUser?._doc;
    return dataUser._doc; */
  }

  async getDataBusinessOwner(id: string): Promise<any> {
    //console.log('id:...', id);
    const dataUser = await this.userModel.findById(id);
    return dataUser;
  }

  update(id: string, updateUserDto: any) {
    //actualizar el usuario
    console.log('updateUserDto(SERVICE):...', updateUserDto);
    return this.userModel.findByIdAndUpdate({ _id: id }, updateUserDto, {
      new: true,
    });
    //return `This action updates a #${id} user`;
  }

  async updatePassword(email: string, datapassword: string): Promise<any> {
    const user: any = await this.userModel.findOneAndUpdate(
      { email },
      { password: datapassword },
      { new: true },
    );
    //le crearemos un token
    const payload = {
      email: user.email,
      userId: String(user._id),
      userRoles: user.userRoles,
    };
    const token = this.jwtService.sign(payload);
    const { password, _id, ...restUser } = user._doc;
    return { access_token: token, ...restUser };
    //return resUpdate;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getBranchesCategories(email: string): Promise<any> {
    // retornaremos todas las branchCategory distintas de los users que
    // tienen su roleId igual a 'branch'
    // y que pertenecen al businessOwner que tiene el email pasado como parámetro
    // para ello primero se obtiene el id del businessOwner
    const dataUser = await this.findOneByEmail(email);
    //console.log('dataUser:...', dataUser);
    if (dataUser?.error || !dataUser)
      return { error: dataUser.error || 'User not found' };
    const idBusinessOwner = String(dataUser._id);

    const categories = await this.userModel
      .find({ roleId: 'branch', businessOwner: idBusinessOwner })
      .distinct('branchCategory');

    return { categories };
  }

  async filterBranches(datafilter: any): Promise<any> {
    const { emailBusinessOwner, category, query } = datafilter;
    // buscamos el id del businessOwner a partir del email
    const dataUser = await this.findOneByEmail(emailBusinessOwner);
    if (dataUser?.error || !dataUser)
      return { error: dataUser.error || 'User not found' };
    const idBusinessOwner = String(dataUser._id);
    let dataBranches: any[] = [];
    if (category && query) {
      dataBranches = await this.userModel.find({
        businessOwner: idBusinessOwner,
        branchCategory: category,
        $or: [
          { businessName: { $regex: query, $options: 'i' } },
          { legalName: { $regex: query, $options: 'i' } },
          { shortDescription: { $regex: query, $options: 'i' } },
        ],
      });
    } else if (category) {
      dataBranches = await this.userModel.find({
        businessOwner: idBusinessOwner,
        branchCategory: category,
      });
    } else if (query) {
      dataBranches = await this.userModel.find({
        businessOwner: idBusinessOwner,
        $or: [
          { businessName: { $regex: query, $options: 'i' } },
          { legalName: { $regex: query, $options: 'i' } },
          { shortDescription: { $regex: query, $options: 'i' } },
        ],
      });
    }

    return { dataBranches };
  }

  async getBranches(emailBusinessOwner: string, query: string, page:number, limit:number): Promise<any> {
    //console.log('emailUser(searchBranches):...', emailBusinessOwner);
    //primero se obtiene el id del businessOwner
    const dataUser = await this.findOneByEmail(emailBusinessOwner);
    //console.log('dataUser:...', dataUser);
    if (dataUser?.error || !dataUser)
      return { error: dataUser.error || 'User not found' };
    const idBusinessOwner = String(dataUser._id);
    //contemplar la posibilidad de que query sea '' para que devuelva todos los branches del businessOwner
    //usando el plugin mongoose-paginate-v2

    if (query === '') {
      return this.userModel.paginate(
        { roleId: 'branch', businessOwner: idBusinessOwner },
        {
          page: page,
          limit: limit,
          lean: true,
        },
      );
    }else{
      return this.userModel.paginate(
        {
          roleId: 'branch',
          businessOwner: idBusinessOwner,
          $or: [
            { businessName: { $regex: query, $options: 'i' } },
            { legalName: { $regex: query, $options: 'i' } },
            { shortDescription: { $regex: query, $options: 'i' } },
            { branchCategory: { $regex: query, $options: 'i' } },
            { city: { $regex: query, $options: 'i' } },
            { state: { $regex: query, $options: 'i' } },
          ],
        },
        {
          page: page,
          limit: limit,
          lean: true,
        },
      );
    }

  }

  async findEmployees(emailBusinessOwner: string): Promise<any> {
    const dataUser = await this.findOneByEmail(emailBusinessOwner);
    const idBusinessOwner = String(dataUser._id);
    //buscaremos todos los usuarios que tengan como businessOwner el id del businessOwner y que su roleId sea 'manager' o 'cashier' o 'supervisor' o 'handyman'
    const dataEmployees = await this.userModel.find({
      businessOwner: idBusinessOwner,
      roleId: { $in: ['manager', 'cashier', 'supervisor', 'handyman'] },
    });
    return dataEmployees;
  }


  async filterEmployees(dataFilter: any): Promise<any> {
    const { category, query, emailBusinessOwner } = dataFilter;
    //buscamos el id del businessOwner a partir del email
    console.log('emailBusinessOwner:...', emailBusinessOwner);
    console.log('category:...', category);
    console.log('query:...', query);
    //contemplar la posibilidad de que el emailBusinessOwner sea su id en lugar de su email
    let dataUser: any = {};
    const regexEmail = /\S+@\S+\.\S+/;
    if (regexEmail.test(emailBusinessOwner)) {
      dataUser = await this.findOneByEmail(emailBusinessOwner);
    } else {
      dataUser={
        _id: emailBusinessOwner
      };
    }
    //dataUser:any = await this.findOneByEmail(emailBusinessOwner);
    if (dataUser?.error || !dataUser)
      return { error: dataUser?.error || 'User not found' };
    const idBusinessOwner = String(dataUser?._id);
    let dataEmployees: any[] = [];
    //primero se debe tomar en cuanta que el usuario en su parametro businessOwner debe ser igual al idBusinessOwner
    //tomar en cuenta que category puede ser '' y query puede ser '' 
    //tambien considerar que category puede estar en el array de userRoles o en el roleId
    //query puede ser una palabra o parte de una palabra en mayusculas o minusculas tanto en el businessName como en el legalName
    //el query tambien puede ser el email del empleado que podria coincidir total o parcialmente

    if (category && query) {
      dataEmployees = await this.userModel.find({
        businessOwner: idBusinessOwner,
        $or: [
          { roleId: category },
          { userRoles: category },
          { businessName: { $regex: query, $options: 'i' } },
          { legalName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      });
    } else if (category) {
      dataEmployees = await this.userModel.find({
        businessOwner: idBusinessOwner,
        $or: [
          { roleId: category },
          { userRoles: category },
        ],
      });
    } else if (query) {
      dataEmployees = await this.userModel.find({
        businessOwner: idBusinessOwner,
        $or: [
          { businessName: { $regex: query, $options: 'i' } },
          { legalName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      });
    }

    return { dataEmployees };
  }

}
