import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('sales')
export class VentasController {
  constructor(
    //eslint-disable-next-line prettier/prettier
    private readonly ventasService: VentasService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('create')
  create(
    @Body() createVentaDto: CreateVentaDto,
    @Req() req: any,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    //console.log('userToken:...', token);
    //extraer el id del usuario del token
    const dataToken:any = this.jwtService.decode(token);
    const { userId } = dataToken;
    //agregar el id del usuario al objeto de la venta
    createVentaDto.client = String(userId);
    //calcular el total de la venta en base a los products de la venta
    let total = 0;
    createVentaDto.products.forEach((product: any) => {
      total += product.price * product.units;
    });
    createVentaDto.total = total;

    //console.log('dataToken:...', dataToken);
    //console.log('createVentaDto:...', createVentaDto);
    //return { message: 'Venta creada', data: createVentaDto}
    return this.ventasService.create(createVentaDto);
  }

  @Post('update/:id')
  updateById(
    @Param('id') id: string,
    @Body() updateVentaDto: any,
  ) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Get()
  findAll(
    @Req() req: any,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    //extraer el id del usuario del token
    const dataToken:any = this.jwtService.decode(token);
    const { userId } = dataToken;
    return this.ventasService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ventasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto) {
    return this.ventasService.update(id, updateVentaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ventasService.remove(+id);
  }
}
