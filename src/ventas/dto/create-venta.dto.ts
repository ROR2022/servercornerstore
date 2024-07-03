export class CreateVentaDto {
  client: string;
  businessOwner: string;
  cashier: string;
  supervisor: string;
  manager: string;
  branch: string;
  products: Array<any>;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentIntent: string;
  deliveryStatus: string;
  deliveryAddress: string;
  deliveryDate: Date;
  deliveryTime: string;
}
