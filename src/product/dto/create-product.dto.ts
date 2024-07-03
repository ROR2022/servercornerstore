export class CreateProductDto {
  name: string;
  price: number;
  description: string;
  stock: number;
  category: string;
  imageUrl: string;
  qrCodeUrl: string;
  barCodeUrl: string;
  businessOwner: string;
}
