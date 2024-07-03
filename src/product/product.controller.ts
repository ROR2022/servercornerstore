import { Controller, Get, Post, Body, Patch, Param, Delete, 
  UseInterceptors, UseGuards, UploadedFile, ParseFilePipeBuilder, 
  HttpException, HttpStatus, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
//import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthorizationGuard } from 'src/authorization/authorization.guard';
import { AppService } from 'src/app.service';
import { uploadOneFileToBucket } from 'src/lib/awsLib';
import * as QRCode from 'qrcode';
import * as bwipjs from 'bwip-js';
import { Roles } from 'src/authorization/roles.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('product')
export class ProductController {
  dataEnv: any;
  
  constructor(
    // eslint-disable-next-line prettier/prettier
    private readonly productService: ProductService,
    private readonly appService: AppService,
    private readonly userService: UsersService
  ) {
    this.dataEnv = this.appService.getDataEnv();
  }

  /*en este método se crea un nuevo producto en la base de datos, se debe preparar
  para recibir la imagen del producto la cual sera opcional
  **/

  @UseGuards(JwtAuthGuard, AuthorizationGuard)
  @Roles('businessOwner')
  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async create(
    @Req() req: any,
    @Body() createProductDto: CreateProductDto,
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
    //primero se obtiene el id del businessOwner que esta creando el producto desde el accessToken
    // que se encuentra en el req.user 
    const idBusinessOwner = req.user.userId;
    createProductDto.businessOwner = idBusinessOwner;
    //primero se crea el producto en la base de datos para obtener el id del mismo
    const newProduct:any = await this.productService.create(createProductDto);
    //si el producto se creo correctamente se procede a subir la imagen del producto
    //console.log('newProduct:...', newProduct);
    //se obtiene el id del producto creado
    const idProduct = String(newProduct?._id);
    //console.log('idProduct:...', idProduct);
    if(file){
      //utilizamos la librería awsLib para subir la imagen a un bucket de s3
      const resultUpload = await uploadOneFileToBucket(file, idProduct, this.dataEnv);
      if(resultUpload?.error){
        return {msg: 'Error al subir la imagen', error: resultUpload.error};
      }
      createProductDto.imageUrl=`https://${this.dataEnv.AWS_BUCKETNAME}.s3.us-east-2.amazonaws.com/${idProduct}/${file.originalname}`;
    }
    //se crean los códigos QR y de barras para el id del producto y se suben al bucket de s3
    const qrCode = await QRCode.toDataURL(idProduct.toString());
    const qrCodeBuffer = Buffer.from(qrCode.split(',')[1], 'base64');
    const dataFileQR = {
      buffer: qrCodeBuffer,
      originalname: `${idProduct}QRCode.png`,
    };
    const resultUploadQR = await uploadOneFileToBucket(dataFileQR, idProduct, this.dataEnv);
    createProductDto.qrCodeUrl=`https://${this.dataEnv.AWS_BUCKETNAME}.s3.us-east-2.amazonaws.com/${idProduct}/${dataFileQR.originalname}`;
    if(resultUploadQR?.error){
      return {msg: 'Error al subir el código QR', error: resultUploadQR.error};
    }
    const barcodeDataUrl = await bwipjs.toBuffer({
      bcid: 'code128',
      text: idProduct.toString(),
      scale: 3,
      height: 10,
      paddingheight: 3,
      paddingwidth: 3,
      includetext: true,
      textxalign: 'center',
    });
    const dataFileBarcode = {
      buffer: barcodeDataUrl,
      originalname: `${idProduct}BarCode.png`,
    };
    const resultUploadBarcode = await uploadOneFileToBucket(dataFileBarcode, idProduct, this.dataEnv);
    createProductDto.barCodeUrl=`https://${this.dataEnv.AWS_BUCKETNAME}.s3.us-east-2.amazonaws.com/${idProduct}/${dataFileBarcode.originalname}`;
    if(resultUploadBarcode?.error){
      return {msg: 'Error al subir el código de barras', error: resultUploadBarcode.error};
    }
    //se actualiza el producto con las urls de las imágenes
    const resUpdateProduct= await this.productService.update(idProduct, createProductDto);

    return {msg: 'Producto creado correctamente', dataProduct: resUpdateProduct};
  }

  
  @Get('businessOwner/:email')
  async findAll(@Param() params:any): Promise<any>{
    //console.log('recuperando productos del businessOwner:...', params.email);
    const emailBusinessOwner = params.email;
    const dataBusinessOwner = await this.userService.findOneByEmail(emailBusinessOwner);
    if(dataBusinessOwner?.error||!dataBusinessOwner){
      return {msg: 'Error al buscar el businessOwner', error: dataBusinessOwner?.error};
    }
    const idBusinessOwner = String(dataBusinessOwner?._id);
    return this.productService.findAllByBusinessOwner(idBusinessOwner);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Patch(':id')
  async update(
    @Param('id') id: string, @Body() updateProductDto: any,
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
    console.log('updateProductDto(inicia proceso):...', updateProductDto);
    console.log('file:...', file);
    console.log('id:...', id);
    if(file){
      //utilizamos la librería awsLib para subir la imagen a un bucket de s3
      const resultUpload:any = await uploadOneFileToBucket(file, id, this.dataEnv);
      console.log('resultUploadImage(updateProduct):...', resultUpload);
      if(resultUpload?.error || !resultUpload){
        return {msg: 'Error al subir la imagen', error: resultUpload?.error};
      }
      updateProductDto.imageUrl=`https://${this.dataEnv.AWS_BUCKETNAME}.s3.us-east-2.amazonaws.com/${id}/${file.originalname}`;
    }
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }


  @Get('categories/:email')
  async getCategories(@Param('email') email:string): Promise<any>{
    //console.log('emailUser(searchCategories):...', email);
    return this.productService.getCategories(email);
  }

  @Post('filter')
  async filterProducts(@Body() dataFilter: any): Promise<any>{
    console.log('dataFilter:...', dataFilter);
    return this.productService.filterProducts(dataFilter);
  }

}
