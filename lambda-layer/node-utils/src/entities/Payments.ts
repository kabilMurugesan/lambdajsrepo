import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Job } from './Job';
@Entity()
export class Payments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { nullable: false, unique: true })
  transactionId: number;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('varchar', { nullable: false })
  jobId: string;

  @Column('varchar', { length: 50, nullable: true })
  stripeChargeId: string;

  @Column('varchar', { length: 20, nullable: true })
  paymentIntentId: string;

  @Column('int', { nullable: true })
  amountCents: number;

  @Column('varchar', { length: 5, nullable: true })
  amountCurrency: string;

  @Column('int', { nullable: true })
  stripeFeeCents: number;

  @Column('varchar', { length: 5, nullable: true })
  stripeFeeCurrency: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column('int', { nullable: true })
  feeCents: number;

  @Column('varchar', { length: 5, nullable: true })
  feeCurrency: string;

  @Column('int', { nullable: true })
  refundAmountCents: number;

  @Column('varchar', { length: 5, nullable: true })
  refundAmountCurrency: string;

  @Column('varchar', { length: 45, nullable: true })
  paymentType: string;

  @Column('varchar', { length: 45, nullable: true })
  txnType: string;

  @Column('varchar', { length: 45, nullable: true })
  paymentMethod: string;

  @Column('varchar', { length: 4, nullable: true })
  last4: string;

  @Column('int', { default: 2, nullable: false })
  payout: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  payoutAmount: number;

  @Column('varchar', { length: 45, nullable: true })
  payoutId: string;

  @Column('varchar', { length: 45, nullable: true })
  brandBank: string;

  @Column('varchar', { length: 45, nullable: true })
  transferId: string;

  @Column('varchar', { length: 45, nullable: true })
  refundId: string;

  @Column('varchar', { nullable: true })
  paidTo: string;

  @Column('varchar', { nullable: true })
  paidAccountId: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  refundAmount: number;

  @Column('int', { nullable: true })
  paymentStatus: number;

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

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;

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
