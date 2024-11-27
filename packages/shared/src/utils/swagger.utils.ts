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
      .addOAuth2(
        {
          type: 'oauth2',
          flows: {
            implicit: {
              authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
              scopes: {
                openid: 'OpenID Connect',
                email: 'Email access',
                profile: 'Profile access',
              },
            },
          },
          description: 'Google OAuth2 authentication',
        },
        'google',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        'JWT',
      )
      .addApiKey(
        {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
        'x-api-key',
      );

    const document = SwaggerModule.createDocument(app, builder.build());

    // Add OAuth2 configurations for each path that uses Google auth
    Object.values(document.paths).forEach((path: any) => {
      if (
        path.post?.tags?.includes('auth') &&
        path.post?.operationId?.includes('google')
      ) {
        path.post.security = [{ google: ['openid', 'email', 'profile'] }];
      }
    });

    SwaggerModule.setup(path, app, document, {
      jsonDocumentUrl: `${path}/json`,
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        oauth2RedirectUrl: `${process.env.APP_URL}/${path}/oauth2-redirect.html`,
        initOAuth: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          scopes: ['openid', 'email', 'profile'],
        },
      },
    });
  }
}
