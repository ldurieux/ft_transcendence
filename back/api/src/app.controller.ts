import { HttpException, HttpStatus, Controller, Get, Res } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(@Res() res) {
    res.status(HttpStatus.OK).json({message: 'API running!'});
  }
}
