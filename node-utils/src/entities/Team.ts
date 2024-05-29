import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Company } from './Company';
import { TeamMembers } from './TeamMembers';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: false })
  name: string;

  @Column('varchar', { nullable: false })
  companyId: string;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => TeamMembers, teamMembers => teamMembers.team)
  teamMembers: TeamMembers[];

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
