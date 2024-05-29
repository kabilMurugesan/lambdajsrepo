import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
  OneToMany,
} from 'typeorm'; //OneToOne
import { GuardJobInterest } from './GuardJobInterest';
// import { UserAvailabilityDay } from "./UserAvailabilityDay";
// import { UserProfile } from "./UserProfile"; // Import the UserProfile entity

@Entity()
@Index('idx_email', ['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  cognitoUserId: string;

  @Column('varchar', { nullable: false, unique: true })
  email: string;

  @Column('varchar', { nullable: false, comment: 'GUARD/CUSTOMER' })
  userType: 'GUARD' | 'CUSTOMER';

  @Column('varchar', { nullable: true, comment: 'INDIVIDUAL/TEAM' })
  guardAccountType: 'INDIVIDUAL' | 'TEAM';

  @Column('integer', {
    nullable: false,
    comment: '0-INACTIVE, 1-ACTIVE, 2-DELETED',
  })
  status: number;

  @Column('varchar', { nullable: true })
  otp: string;

  @Column('varchar', { nullable: true })
  otpExpiryTime: Date;

  @Column('integer', { nullable: true })
  otpRetryCount: number;

  @Column('boolean', { nullable: false, default: false })
  isEmailVerified: boolean;

  @Column('integer', {
    default: 0,
    nullable: false,
    comment: '0-INPROGRESS, 1-ACCEPTED, 2-REJECTED',
  })
  isCertificateVerified: number;

  @Column('boolean', { nullable: true, default: false })
  isPaymentConfigured: boolean;

  @Column('timestamp', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  lastLoggedInDate: Date;

  @Column('varchar', { nullable: false })
  createdBy: string;

  @Column('timestamp', { nullable: false })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @OneToMany(() => GuardJobInterest, guardJobInterest => guardJobInterest.user)
  guardJobInterest: GuardJobInterest[];

  @BeforeInsert()
  updateCreateDates() {
    const currentDate = new Date();
    this.createdOn = currentDate;
    this.updatedOn = currentDate;
    this.lastLoggedInDate = currentDate;
  }

  @BeforeUpdate()
  updateUpdateDates() {
    this.updatedOn = new Date();
  }
}
