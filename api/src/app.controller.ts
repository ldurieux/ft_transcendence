import { HttpException, HttpStatus, Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    throw new HttpException('hey', HttpStatus.NOT_FOUND);
  }
}
