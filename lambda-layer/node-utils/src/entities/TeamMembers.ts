import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Team } from './Team';
// import { User } from './User';
import { UserProfile } from './UserProfile';

@Entity()
export class TeamMembers {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  teamId: string;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('boolean', { nullable: false, default: false })
  isLead: boolean;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => Team, { nullable: false })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  // @ManyToOne(() => User, { nullable: false })
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  @ManyToOne(() => UserProfile, { nullable: false }) // Set up the foreign key relationship with UserProfile entity
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' }) // Provide a unique name for the foreign key constraint
  userProfile: UserProfile;

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
