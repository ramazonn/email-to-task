import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { setMongooseConnection } from './models/MongooseConnection';

@Injectable()
export class MongooseConnectionInitializer implements OnModuleInit {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit(): void {
    setMongooseConnection(this.connection);
  }
}
