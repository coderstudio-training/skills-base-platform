// src/base/base.controller.ts
import { Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { BaseService } from './base.service';
import { PaginationDto } from '../dto/pagination.dto';

export abstract class BaseController<T extends BaseEntity> {
  constructor(private readonly baseService: BaseService<T>) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.baseService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.baseService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: any) {
    return this.baseService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.baseService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.baseService.remove(id);
  }
}
