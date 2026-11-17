
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT) || 5000;

  // Allow frontend requests from localhost (any port), Vercel, and Postman
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // allow requests with no origin (like Postman, curl, mobile apps)
      if (!origin) return callback(null, true);

      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.includes('vercel.app') ||
        origin.includes('onrender.com')
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Backend health check for Postman & Frontend
  app.getHttpAdapter().get('/', (req, res) => {
    res.send({
      status: 'ok',
      message: 'Backend is connected and running',
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME || 'defaultdb',
      host: process.env.DB_HOST || 'mysql',
    });
  });

  await app.listen(port, '0.0.0.0');

  console.log(`Server listening on port ${port}`);
}

bootstrap();
