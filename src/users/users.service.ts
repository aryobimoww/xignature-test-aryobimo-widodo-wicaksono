import { Injectable } from '@nestjs/common';
import { Users } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersDto } from './users.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private UsersRepository: Repository<Users>,
  ) {}

  async getAll() {
    return await this.UsersRepository.find();
  }

  async create(data: UsersDto) {
    const usersNew = await this.UsersRepository.create(data);
    await this.UsersRepository.save(usersNew);
    const { password, ...res } = usersNew;
    return res;
  }

  async auth(condition: any): Promise<Users> {
    return this.UsersRepository.findOne(condition);
  }

  async update(data: UsersDto, id: number) {
    return this.UsersRepository.save({ ...data, id: id });
  }

  async delete(id: number) {
    return this.UsersRepository.delete(id);
  }
}
