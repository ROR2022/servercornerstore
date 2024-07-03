import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  userRole: string | undefined | null;
  businessName: string | undefined | null;
  slogan: string | undefined | null;
  shortDescription: string | undefined | null;
  longDescription: string | undefined | null;
  email: string | undefined | null;
  password: string | undefined | null;
  imageUrl: string | undefined | null;
  legalName: string | undefined | null;
  shortAddress: string | undefined | null;
  phone: string | undefined | null;
  completeAddress: string | undefined | null;
  city: string | undefined | null;
  state: string | undefined | null;
  country: string | undefined | null;
  postalCode: string | undefined | null;
  webSite: string | undefined | null;
  facebook: string | undefined | null;
  instagram: string | undefined | null;
  twitter: string | undefined | null;
}
