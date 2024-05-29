import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  // JoinColumn,
  // ManyToOne,
} from 'typeorm'; //
// import { State } from './State';
// import { City } from './City';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: false })
  teamName: string;

  @Column('varchar', { length: 100, nullable: false })
  companyName: string;

  @Column('varchar', { nullable: false, unique: false })
  companyEmail: string;

  @Column('varchar', { length: 20, nullable: true })
  companyPhone: string;

  @Column('varchar', { nullable: false })
  street1: string;

  @Column('varchar', { nullable: true })
  street2: string;

  @Column('varchar', { nullable: true })
  country: string;

  @Column('varchar', { nullable: true })
  city: string;

  @Column('varchar', { length: 50, nullable: true })
  companyPhotoFileName: string;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  // @ManyToOne(() => State, { nullable: true }) // Define the relationship with State
  // @JoinColumn({ name: 'state_id' })
  // state: State;

  // @ManyToOne(() => City, { nullable: true }) // Define the relationship with City
  // @JoinColumn({ name: 'city_id' })
  // city: City;

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
