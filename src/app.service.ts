import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  InitMS() {
    return 'Microservice is up and running!';
  }
}
