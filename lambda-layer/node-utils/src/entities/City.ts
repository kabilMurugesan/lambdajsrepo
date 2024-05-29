import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { State } from './State'; // Import the State entity

@Entity()
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: false })
  name: string;

  @Column('varchar', { nullable: false })
  stateId: string;

  @Column('tinyint', {
    nullable: false,
    default: 0,
    comment: '0-INACTIVE, 1-ACTIVE, 2-DELETED',
  })
  status: number;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => State, (state) => state.cities) // Define the inverse relationship
  state: State;

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
