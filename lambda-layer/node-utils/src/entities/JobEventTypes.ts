import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
} from 'typeorm';
import { JobInterest } from './JobInterest';
import { Job } from './Job';

@Entity()
export class JobEventTypes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  jobId: string;

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

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'job_id' })
  job: Job;

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
