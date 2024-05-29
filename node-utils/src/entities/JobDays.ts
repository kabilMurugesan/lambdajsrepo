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

@Entity()
export class JobDay {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { nullable: false })
    jobId: string;

    @Column('varchar', { nullable: false })
    startTime: string;

    @Column('varchar', { nullable: false })
    endTime: string;

    @Column('varchar', { nullable: false })
    day: string;

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
