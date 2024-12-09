import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export class Connection {
  private MONGO_DB_URI = process.env.MONGO_DB_URI!;

  constructor() {
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(`${this.MONGO_DB_URI}`);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  }
}
