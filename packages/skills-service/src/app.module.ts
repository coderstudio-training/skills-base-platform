import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaxonomyModule } from './taxonomy/taxonomy.module';

@Module({
  imports: [TaxonomyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
