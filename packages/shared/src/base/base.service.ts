// src/base/base.service.ts
import { Model, Document } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { PaginationDto } from '../dto/pagination.dto';

export abstract class BaseService<T extends BaseEntity> {
  constructor(private readonly model: Model<T & Document>) {}

  async findAll(paginationDto: PaginationDto): Promise<T[]> {
    const { page = 1, limit = 10 } = paginationDto;
    return this.model
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
  }

  async findOne(id: string): Promise<T> {
    const entity = await this.model.findById(id).exec();
    if (!entity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return entity;
  }

  async create(createDto: any): Promise<T> {
    const createdEntity = new this.model(createDto);
    return createdEntity.save();
  }

  async update(id: string, updateDto: any): Promise<T> {
    const updatedEntity = await this.model
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updatedEntity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return updatedEntity;
  }

  async remove(id: string): Promise<T> {
    const deletedEntity = await this.model.findByIdAndDelete(id).exec();
    if (!deletedEntity) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return deletedEntity;
  }
}
