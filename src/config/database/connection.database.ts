import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export class Connection {
  private DB_HOST = process.env.DB_HOST!;
  private DB_NAME = process.env.DB_NAME!;

  constructor() {
    this.connect();
  }

  async connect() {
    try {
      await mongoose.connect(`${this.DB_HOST}/${this.DB_NAME}`);
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Error connecting to the database:', error);
    }
  }
}
