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
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('varchar', { length: 20, nullable: false })
  type: string;

  @Column('varchar', { length: 50, nullable: false })
  title: string;

  @Column('varchar', { length: 150, nullable: true })
  message: string;

  @Column('varchar', {
    length: 50,
    nullable: false,
    comment: 'Landing page reference',
  })
  landingPage: string;

  @Column('varchar', { nullable: true })
  landingPageId: string;

  @Column('varchar', { nullable: false, default: 'PENDING' })
  status: string;

  @Column('boolean', { nullable: false, default: false })
  isRead: boolean;

  @Column('varchar', { nullable: true })
  responseCode: string;

  @Column('varchar', { nullable: true })
  responseMsg: string;

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
