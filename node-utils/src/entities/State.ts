import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { City } from './City'; // Import the City entity

@Entity()
export class State {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: false })
  name: string;

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

  @OneToMany(() => City, (city) => city.state)
  cities: City[];

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
