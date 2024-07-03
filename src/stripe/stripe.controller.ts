import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';

@Controller('stripe')
export class StripeController {
  constructor(
    //eslint-disable-next-line prettier/prettier
    private readonly stripeService: StripeService
  ) {}


  @Post('createPaymentIntent')
  async createPaymentIntent(@Body() data: any) {
    //console.log('data:...', data);
    const { items, dataIdSale } = data;
    
    console.log('items(StripeController):...', items?.length);
    // Create a PaymentIntent with the order amount and currency
    return await this.stripeService.createPaymentIntent(items, dataIdSale);
  }



  @Post()
  create(@Body() createStripeDto: CreateStripeDto) {
    return this.stripeService.create(createStripeDto);
  }

  @Get()
  findAll() {
    return this.stripeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stripeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStripeDto: UpdateStripeDto) {
    return this.stripeService.update(+id, updateStripeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stripeService.remove(+id);
  }
}
