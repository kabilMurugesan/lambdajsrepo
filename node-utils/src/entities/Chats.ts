import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Job } from './Job';
import { UserProfile } from './UserProfile';

@Entity()
export class Chats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: true })
  jobId: string;

  @Column('boolean', {
    nullable: false,
    default: false,
  })
  isDeleted: boolean;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'userId' })
  userProfile: UserProfile;

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
