import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity()
export class Configurations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', {
    nullable: false,
    comment: 'FIDO COMMISSION FEE PERCENTAGE',
    precision: 10,
    scale: 2,
  })
  commissionFeePercentage: number;

  @Column('decimal', {
    nullable: false,
    comment: 'STRIPE TRANSACTION FEE PERCENTAGE',
    precision: 10,
    scale: 2,
  })
  stripeTransactionFeePercentage: number;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

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
