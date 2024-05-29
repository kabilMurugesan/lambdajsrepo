import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
} from 'typeorm'; //OneToOne
import { User } from './User';

@Entity()
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { nullable: false })
  jobRefId: number;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('varchar', { nullable: false })
  jobName: string;

  @Column('varchar', { nullable: false })
  timeZoneName: string;

  @Column('varchar', { nullable: false })
  guardCoverageId: string;

  @Column('varchar', { nullable: false })
  guardSecurityServiceId: string;

  @Column('integer', { nullable: false })
  noOfGuards: number;

  @Column('varchar', { nullable: true })
  bookingReason: string;

  @Column('timestamp', { nullable: false })
  startDate: Date;

  @Column('timestamp', { nullable: false })
  endDate: Date;

  @Column('varchar', { nullable: true })
  jobVenue: string;

  @Column('varchar', { nullable: false })
  jobVenueLocationCoordinates: string;

  @Column('varchar', { nullable: true })
  jobVenueRadius: string;

  @Column('boolean', { nullable: false, default: false })
  isJobDeletedByAdmin: boolean;

  @Column('boolean', { nullable: false, default: false })
  isJobCreated: boolean;

  @Column('boolean', { nullable: false, default: false })
  isGuardAdded: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  jobCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  commissionFeePercentage: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  commissionCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  crimeRateCommissionPercentage: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  crimeRateCommissionCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  stripeTransactionFeePercentage: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  transactionCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  minimumTimeExtraCost: number;

  @Column('integer', { nullable: false, default: 0 })
  paymentStatus: number;

  @Column('varchar', { nullable: false, default: 'pending' })
  paymentChargeStatus: string;

  @Column('varchar', { nullable: true })
  paymentChargeId: string;

  @Column('boolean', { nullable: true, default: false })
  captureStatus: boolean;

  @Column('boolean', { nullable: true, default: false })
  paidStatus: boolean;

  @Column('varchar', { nullable: true })
  balanceTransactionId: string;

  @Column('varchar', { length: 10, nullable: false })
  paymentType: string;

  @Column('varchar', { length: 10, nullable: false })
  last4: string;

  @Column('varchar', { nullable: false })
  paymentSource: string;

  @Column('varchar', { length: 45, nullable: false })
  paymentMethod: string;

  @Column('varchar', { length: 45, nullable: false })
  stripeChargeId: string;

  @Column('timestamp', { nullable: false })
  transactionDate: Date;

  @Column('varchar', { nullable: false })
  createdBy: string;

  @Column('timestamp', { nullable: false })
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
