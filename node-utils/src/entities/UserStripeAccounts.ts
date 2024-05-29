import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
} from 'typeorm'; //
import { User } from './User'; // Import the User entity

@Entity()
export class UserStripeAccounts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('varchar', { nullable: false })
  stripeToken: string;

  @Column('varchar', { length: 100, nullable: true })
  name: string;

  @Column('varchar', { length: 20, nullable: true })
  routingNumber: string;

  @Column('varchar', { length: 4, nullable: true })
  accountLast4Digits: string;

  @Column('varchar', { length: 20, nullable: true })
  accountType: string;

  @Column('text', { nullable: true })
  stripeAccountId: string;

  @Column('text', { nullable: true })
  fingerprint: string;

  @Column('integer', {
    default: 0,
    nullable: false,
  })
  isPrimary: number;

  @Column('integer', {
    default: 1,
    nullable: false,
    comment: '0-INACTIVE, 1-ACTIVE, 2-DELETED',
  })
  status: number;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => User)
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
