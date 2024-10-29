import { CustomEntity } from 'src/__shared__/models/global';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('employees')
export class Employee extends CustomEntity {
  @OneToOne(() => User, (user) => user.employee)
  @JoinColumn()
  user: User;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column({ unique: true })
  identifier: string;
}
