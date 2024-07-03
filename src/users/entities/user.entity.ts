import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, mongo } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate-v2';

export type UserDocument = HydratedDocument<User>;

//agregaremos al roleId que solo acepte: 'adminRoot', 'businessOwner', 'client'

@Schema({ timestamps: true })
export class User {
  @Prop()
  userRoles: Array<string>;

  @Prop({
    required: true,
    enum: [
      'adminRoot',
      'businessOwner',
      'client',
      'manager',
      'cashier',
      'supervisor',
      'handyman',
      'branch',
    ],
  })
  roleId: string;

  @Prop({ required: true })
  businessName: string;

  @Prop()
  businessCategory: string;

  @Prop()
  branchCategory: string;

  @Prop()
  slogan: string;

  @Prop()
  shortDescription: string;

  @Prop()
  longDescription: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  imageUrl: string;

  @Prop()
  legalName: string;

  @Prop()
  shortAddress: string;

  @Prop()
  phone: string;

  @Prop()
  completeAddress: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  country: string;

  @Prop()
  postalCode: string;

  @Prop()
  webSite: string;

  @Prop()
  facebook: string;

  @Prop()
  instagram: string;

  @Prop()
  twitter: string;

  @Prop()
  userStatus: string;

  @Prop({ type: mongo.ObjectId, ref: 'User' })
  businessOwner: string;

  @Prop({ type: mongo.ObjectId, ref: 'User' })
  manager: string;

  @Prop({ type: [mongo.ObjectId], ref: 'User' })
  cashier: Array<string>;

  @Prop({ type: [mongo.ObjectId], ref: 'User' })
  supervisor: Array<string>;

  @Prop({ type: [mongo.ObjectId], ref: 'User' })
  handyman: Array<string>;

  @Prop({ type: [mongo.ObjectId], ref: 'User' })
  branch: Array<string>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(mongoosePaginate);

UserSchema.pre('save', function (next) {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  const localDate = new Date(now.getTime() - timezoneOffset);
  this.createdAt = localDate;
  this.updatedAt = localDate;
  next();
});
