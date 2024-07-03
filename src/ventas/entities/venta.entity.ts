import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, mongo } from 'mongoose';

export type VentaDocument = HydratedDocument<Venta>;

@Schema({ timestamps: true })
export class Venta {
  @Prop({ type: mongo.ObjectId, ref: 'User' })
  client: string;

  @Prop({ type: mongo.ObjectId, ref: 'User' })
  businessOwner: string;

  @Prop({ type: mongo.ObjectId, ref: 'User' })
  cashier: string;

  @Prop({ type: mongo.ObjectId, ref: 'User' })
  supervisor: string;

  @Prop({ type: mongo.ObjectId, ref: 'User' })
  manager: string;

  @Prop({ type: mongo.ObjectId, ref: 'User' })
  branch: string;

  @Prop()
  products: Array<any>;

  @Prop()
  total: number;

  @Prop()
  paymentMethod: string;

  @Prop()
  paymentStatus: string;

  @Prop()
  paymentIntent: string;

  @Prop()
  deliveryStatus: string;

  @Prop()
  deliveryAddress: string;

  @Prop()
  deliveryDate: Date;

  @Prop()
  deliveryTime: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const VentaSchema = SchemaFactory.createForClass(Venta);

VentaSchema.pre('save', function (next) {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - timezoneOffset);
  this.createdAt = localDate;
  this.updatedAt = localDate;
  next();
});

//agregar un hook para actualizar la fecha de modificación

VentaSchema.pre('findOneAndUpdate', function () {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - timezoneOffset);
  (this as any)._update.updatedAt = localDate;
});
