import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
} from 'typeorm'; //
import { User } from './User'; // Import the User entity

@Entity()
export class UserStripeDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false, unique: true })
  userId: string;

  @Column('varchar', { nullable: true })
  stripeAccountId: string;

  @Column('varchar', { nullable: true })
  stripeCustomerId: string;

  @Column('integer', {
    default: 1,
    nullable: false,
  })
  isStripeVerified: number;

  @Column('boolean', { nullable: false, default: true })
  status: boolean;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @BeforeInsert()
  updateCreateDates() {
    const currentDate = new Date();
    this.createdOn = currentDate;
    this.updatedOn = currentDate;
  }

  @BeforeUpdate()
  updateUpdateDates() {
    this.updatedOn = new Date();
  }
}
