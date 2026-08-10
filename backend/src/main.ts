import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Bike Fleet Management API')
    .setDescription(
      'REST API for managing an e-bike rental fleet: bikes, riders, assignments, payments, ' +
        'maintenance, expenses, traffic violations, inspections, notifications, dashboard KPIs and reports.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token returned by POST /api/auth/login',
      },
      'access-token',
    )
    .addTag('auth', 'Login and current-session user')
    .addTag('bikes', 'Fleet vehicle records')
    .addTag('riders', 'Rider (renter) records')
    .addTag('assignments', 'Bike-to-rider rental assignments')
    .addTag('payments', 'Rent payments for an assignment')
    .addTag('maintenance', 'Bike maintenance/service history')
    .addTag('expenses', 'General fleet expenses')
    .addTag('violations', 'Traffic fines/violations')
    .addTag('inspections', 'Before/after handover inspections')
    .addTag('notifications', 'System reminders and alerts')
    .addTag('dashboard', 'Aggregate fleet KPIs')
    .addTag('reports', 'Financial and operational reports')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`E-Bike Fleet backend listening on http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
