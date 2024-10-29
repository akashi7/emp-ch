import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureSwagger(app: INestApplication): void {
  const SWAGGER_URL = '/swagger';
  const options = new DocumentBuilder()
    .setTitle('MANAGEMENT APP')
    .setDescription('API DOCUMENTATION')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(SWAGGER_URL, app, document, {
    customSiteTitle: 'Managment APP API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      apisSorter: 'alpha',
      operationsSorter: 'method',
      tagsSorter: 'alpha',
    },
  });
}
