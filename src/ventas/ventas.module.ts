import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Venta, VentaSchema } from './entities/venta.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Venta.name, schema: VentaSchema }]),
    JwtModule.register({
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}
