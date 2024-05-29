import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
} from 'typeorm';
import { User } from './User'; // Import the User entity
import { JobInterest } from './JobInterest'; // Import the JobInterest entity
import { UserProfile } from './UserProfile';

@Entity()
export class GuardJobInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('varchar', { nullable: false })
  jobInterestId: string;

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

  @ManyToOne(() => UserProfile, userProfile => userProfile.guardJobInterest)
  @JoinColumn({ name: 'userId' })
  userProfile: UserProfile;


  @ManyToOne(() => JobInterest)
  @JoinColumn({ name: 'job_interest_id' })
  jobInterest: JobInterest;

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
