import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { GuardJobInterest } from './GuardJobInterest'; // Import the GuardJobInterest entity

@Entity()
export class JobInterest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50, nullable: false })
  interestName: string;

  @Column('varchar', { length: 150, nullable: false })
  description: string;

  @Column('int', { nullable: false })
  displayOrder: number;

  @Column('tinyint', {
    nullable: false,
    comment: '1-How Long?, 2-Service Type',
  })
  interestType: number;

  @Column('tinyint', {
    nullable: false,
    default: 0,
    comment: '0-INACTIVE, 1-ACTIVE, 2-DELETED',
  })
  status: number;

  @Column('varchar', { nullable: false })
  createdBy: string;

  @Column('timestamp', { nullable: false })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @OneToMany(
    () => GuardJobInterest,
    (guardJobInterest) => guardJobInterest.jobInterest
  )
  guardJobInterests: GuardJobInterest[];

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
