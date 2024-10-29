import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ERoles } from 'src/__shared__/enums/enum';
import { User } from 'src/__shared__/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedData implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedOnInit();
  }

  async seedOnInit() {
    const admin = await this.userRepository.findOne({
      where: { role: ERoles.ADMIN },
    });
    if (admin) return;

    const adminEmail = 'kukushi@gmail.com';

    const isUserExist = await this.userRepository.findOne({
      where: {
        email: adminEmail,
      },
    });
    if (isUserExist) return;
    const password = await bcrypt.hash('akashi', 8);
    const adminUser = this.userRepository.create({
      email: adminEmail,
      password,
      role: ERoles.ADMIN,
    });
    await this.userRepository.save(adminUser);
    console.log('Admin user created');
  }
}
