import { Injectable } from '@nestjs/common';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import Stripe from 'stripe';
import { AppService } from 'src/app.service';

@Injectable()
export class StripeService {
  //eslint-disable-next-line prettier/prettier
  private stripe: Stripe;
  private dataEnv: any;

  constructor(
    private readonly appService: AppService,
  ) {
    this.dataEnv = this.appService.getDataEnv();
    this.stripe = new Stripe(this.dataEnv.STRIPE_SECRET_KEY_DEV, {
      apiVersion: '2024-06-20',
    });
  }

  calculateOrderAmount = (items: any) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    //console.log('items(shoppingCart StripeService):...', items);
    //calularemos el total de los items basado en su price y units 
    let total = 0;
    items.forEach((item: any) => {
      total += item.price * item.units;
    });

    console.log('total(StripeService):...', total); 
    return total;
  };

  async createPaymentIntent(items:any, dataIdSale: any) {
    //console.log('items(StripeService):...', items);
    try {
      const myAmount = this.calculateOrderAmount(items);
      console.log('myAmount(StripeService):...', myAmount);
      const paymentIntent:any = await this.stripe.paymentIntents.create({
        amount: myAmount*100,
        currency: 'mxn',
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          dataIdSale: dataIdSale,
        }
      });
      console.log('paymentIntent(StripeService):...');
      return {
        totalAmount: myAmount,
        clientSecret: paymentIntent?.client_secret||'client_secret not found',
      };
      
    } catch (error) {
      console.log('error(StripeService):...', error);
      return {
        clientSecret: 'error',
      };
    }
    
    
  }
  

  create(createStripeDto: CreateStripeDto) {
    return 'This action adds a new stripe';
  }

  findAll() {
    return `This action returns all stripe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stripe`;
  }

  update(id: number, updateStripeDto: UpdateStripeDto) {
    return `This action updates a #${id} stripe`;
  }

  remove(id: number) {
    return `This action removes a #${id} stripe`;
  }
}
