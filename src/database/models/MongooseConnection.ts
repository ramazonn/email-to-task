import { Connection, Model } from 'mongoose';

let mongooseConnection: Connection | null = null;

export function setMongooseConnection(connection: Connection): void {
  mongooseConnection = connection;
}

export function getMongooseConnection(): Connection {
  if (!mongooseConnection) {
    throw new Error(
      'Mongoose connection is not initialized. Ensure DatabaseModule is loaded.',
    );
  }

  return mongooseConnection;
}

export function getModel<T>(modelName: string): Model<T> {
  return getMongooseConnection().model<T>(modelName);
}
