import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'; //
import { User } from './User'; // Import the User entity
import { State } from './State'; // Import the State entity
import { City } from './City'; // Import the City entity
import { GuardJobInterest } from './GuardJobInterest';

@Entity()
export class UserProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false, unique: true })
  userId: string;

  @Column('varchar', { length: 50, nullable: true })
  firstName: string;

  @Column('varchar', { length: 50, nullable: true })
  lastName: string;

  @Column('varchar', { length: 20, nullable: true })
  phone: string;

  @Column('varchar', { length: 50, nullable: true })
  profilePhotoFileName: string;

  @Column('varchar', { length: 5, nullable: true })
  countryCode: string;

  @Column('varchar', { nullable: true })
  addressLine1: string;

  @Column('varchar', { nullable: true })
  addressLine2: string;

  @Column('varchar', { nullable: true })
  stateId: string;

  @Column('varchar', { nullable: true })
  cityId: string;

  @Column('varchar', { length: 10, nullable: true })
  zipCode: string;

  @Column('boolean', { nullable: true })
  isPhoneVerified: boolean;

  @Column('varchar', { nullable: true })
  aPostInitiallyCertifiedDate: string;

  @Column('varchar', { nullable: true })
  aPostAnnualFireArmQualificationDate: string;

  @Column('varchar', { length: 50, nullable: true })
  aPostLicenseNo: string;

  @Column('boolean', { default: false, nullable: false })
  isStripeDetailsAdded: boolean;

  @Column('varchar', { length: 50, nullable: true })
  aPostCertFileName: string;

  @Column('integer', {
    default: 0,
    nullable: false,
    comment: '0-INACTIVE, 1-ACCEPTED, 2-REJECTED',
  })
  isAPostCertVerified: number;

  @Column('varchar', { nullable: true })
  srbLicenseIssueDate: string;

  @Column('varchar', { nullable: true })
  srbLicenseExpiryDate: string;

  @Column('varchar', { length: 50, nullable: true })
  srbLicenseNo: string;

  @Column('varchar', { length: 70, nullable: true })
  srbStateId: string;

  @Column('varchar', { length: 50, nullable: true })
  srbCertFileName: string;

  @Column('integer', {
    default: 0,
    nullable: false,
    comment: '0-INACTIVE, 1-ACCEPTED, 2-REJECTED',
  })
  isSrbCertVerified: number;

  @Column('decimal', {
    nullable: true,
    comment: 'RATE PER HOUR',
    precision: 10,
    scale: 2,
  })
  guardJobRate: number;

  @Column('varchar', { length: 9, nullable: true })
  socialSecurityNo: string;

  @Column('boolean', { nullable: true, default: false })
  isProfileInfoAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  isCertVerificationAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  isJobInterestAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  isJobTimingAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  isJobRateAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  IsApostAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  IsAppRatingAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  IsAppReviewAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  IsAsrbAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  IsCompanyAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  IsTeamMemberAdded: boolean;

  @Column('boolean', { nullable: true, default: false })
  IsSuccessInfoAdded: boolean;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @OneToMany(() => GuardJobInterest, guardJobInterest => guardJobInterest.userProfile)
  guardJobInterest: GuardJobInterest[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => State, { nullable: true })
  @JoinColumn({ name: 'state_id' })
  state: State;

  @ManyToOne(() => City, { nullable: true })
  @JoinColumn({ name: 'city_id' })
  city: City;

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
