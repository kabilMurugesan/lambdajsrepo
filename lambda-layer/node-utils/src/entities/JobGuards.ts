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
import { Team } from './Team';
import { Job } from './Job';

@Entity()
export class JobGuards {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  jobId: string;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('boolean', { nullable: true })
  isPunch: boolean;

  @Column('timestamp', { nullable: true })
  guardInTime: Date;

  @Column('timestamp', { nullable: true })
  guardOutTime: Date;

  @Column('varchar', { nullable: true })
  teamId: string;

  @Column('boolean', { nullable: false, default: false })
  isGuardRatingAdded: boolean;

  @Column('boolean', { nullable: false, default: false })
  isUserRatingAdded: boolean;

  @Column('boolean', { nullable: false, default: false })
  isGuardReviewAdded: boolean;

  @Column('boolean', { nullable: false, default: false })
  isUserReviewAdded: boolean;

  @Column('integer', {
    default: 0,
    nullable: false,
    comment: '0-PENDING, 1-ACCEPTED, 2-REJECTED,3-COMPLETED,4-CANCELLED',
  })
  jobStatus: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  jobOrgCostPerHour: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  jobCostPerHour: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalJobHours: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  totalJobAmount: number;

  @Column('timestamp', { nullable: true })
  jobCompletedDate: Date;

  @Column('integer', {
    default: 0,
    nullable: false,
    comment: '0-PENDING, 1-COMPLETED, 2-FAILED',
  })
  transferStatus: number;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

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
