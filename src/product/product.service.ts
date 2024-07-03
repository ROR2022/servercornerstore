import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './entities/product.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductService {

  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
      private readonly jwtService: JwtService,
      private readonly usersService: UsersService,
  ) {
    
     
  }
  async create(createProductDto: CreateProductDto): Promise<any> {
    try {
      const newProduct = new this.productModel(createProductDto);
      const result= await newProduct.save();
      return result;  
    } catch (error) {
      console.log('error:...', error);
      return {error: error};
    }
    
  }

  findAll() {
    return `This action returns all product`;
  }

  async findAllByBusinessOwner(idBusinessOwner: string): Promise<any> {
    const dataProducts= await  this.productModel.find({businessOwner: idBusinessOwner});

    return {dataProducts};
  }

  findOne(id: string) {
    return this.productModel.findById(id);
    //return `This action returns a #${id} product`;
  }

  async update(id: string, dataProduct: any): Promise<any> {
    try {
      const result = await this.productModel.findByIdAndUpdate(id, dataProduct, {new: true});
      return result;
    } catch (error) {
      return {error: error};
    }
    //return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }


  async getCategories(email: string): Promise<any> {
    //retornaremos todas las categorias diferentes de los productos que tiene el businessOwner
    //para ello primero se obtiene el id del businessOwner
    const dataUser = await this.usersService.findOneByEmail(email);
    //console.log('dataUser:...', dataUser);
    if(dataUser?.error || !dataUser) return {error: dataUser.error || 'User not found'};
    const idBusinessOwner = dataUser._id;
    //console.log('idBusinessOwner:...', idBusinessOwner);
    //ahora con el id del businessOwner se obtienen las categorias distintas los productos del businessOwner
    const categories = await this.productModel.find({businessOwner: String(idBusinessOwner)}).distinct('category');
    
    return {categories};

  }

  async filterProducts(datafilter:any): Promise<any> {
    const {emailUser, category, query} = datafilter;
    //buscamos el id del businessOwner a partir del email
    const dataUser = await this.usersService.findOneByEmail(emailUser);
    if(dataUser?.error || !dataUser) return {error: dataUser.error || 'User not found'};
    const idBusinessOwner = dataUser._id;
    //ahora realizamos la busqueda de los productos dependiendo si se envia la categoria o el query o ambos el query se buscara en el nombre del producto y en la descripción
    //el query puede ser una palabra o parte de ella que se busca en el nombre o descripción del producto y puede coincidir en mayusculas o minusculas
    let dataProducts:any[] = [];
    if(category && query){
      dataProducts = await this.productModel.find({businessOwner: String(idBusinessOwner), category, $or: [{name: {$regex: query, $options: 'i'}}, {description: {$regex: query, $options: 'i'}}]});
    }else if(category){
      dataProducts = await this.productModel.find({businessOwner: String(idBusinessOwner), category});
    }
    else if(query){
      dataProducts = await this.productModel.find({businessOwner: String(idBusinessOwner), $or: [{name: {$regex: query, $options: 'i'}}, {description: {$regex: query, $options: 'i'}}]});
    }
    return {dataProducts};
  }

}
