import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { validateEnv } from './env';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

validateEnv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? [
  'http://localhost:3000',
  'https://isometrica.vercel.app',
  'https://isometrica.eng.br',
  /^https:\/\/.*-isometrica\.vercel\.app$/,
];

  app.enableCors({
    origin(origin: string | undefined, callback: (err: Error | null, allow?: string | boolean) => void) {
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some(a => {
        if (a instanceof RegExp) return a.test(origin);
        return a === origin;
      });
      callback(null, allowed || false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Isométrica API')
    .setDescription('Plataforma inteligente de evolução acadêmica')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`API rodando em http://localhost:${port}`);
}
bootstrap();
