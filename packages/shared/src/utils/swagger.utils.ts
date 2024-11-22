import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class SwaggerHelper {
  static setup(
    app: INestApplication,
    title: string,
    path: string = 'swagger',
  ): void {
    const builder = new DocumentBuilder()
      .setTitle(title)
      .setVersion(process.env.APP_VERSION || '1.0')
      .addBearerAuth()
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        'x-api-key',
      );

    const document = SwaggerModule.createDocument(app, builder.build());

    // Setup Swagger with both UI and JSON endpoints
    SwaggerModule.setup(path, app, document, {
      jsonDocumentUrl: `${path}/json`,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
      },
    });
  }
}
