import { Injectable } from '@nestjs/common';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Venta, VentaDocument } from './entities/venta.entity';
import { PaginateModel } from 'mongoose';

@Injectable()
export class VentasService {

  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(Venta.name) private ventaModel: PaginateModel<VentaDocument>,
  ) {

  }
  create(createVentaDto: CreateVentaDto) {
    const newVenta = new this.ventaModel(createVentaDto);
    return newVenta.save();
    //return 'This action adds a new venta';
  }

  findAll(userId: string) {
    //retornamos todas las ventas del businessOwner=userId
    return this.ventaModel.find({ businessOwner: userId });
    //return `This action returns all ventas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} venta`;
  }

  update(id: string, updateVentaDto: any) {
    const resUpdate = this.ventaModel.findByIdAndUpdate(id, updateVentaDto, { new: true });
    return resUpdate;
  }

  remove(id: number) {
    return `This action removes a #${id} venta`;
  }
}

//https://developer.squareup.com/explorer/square_2024-06-04/payments-api/create-payment?params=N4IgRg9gJgngCgQwE4ILYFMAu6kGcQBcoaEArgHaYD6qE56MhxtFmhAjAAycA0IAxqSRJ05fowIgAqgGUAIiAC%2BfAJZR0qAA4RsYmFQDWDQgIDsYAKwBObgGYAtAlPoAbPYAs6c-YAct-j72FujotuymplDstj5WIHy4ZEj86FRqJvzkdAT8yFD2WWLo9hAGSopAA&env=sandbox&v=1
