import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    JoinColumn,
    ManyToMany,
} from 'typeorm'; //OneToOne
import { Job } from './Job';
// import { User } from './User';

@Entity()
export class checkList {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { nullable: false })
    userId: string;

    @Column('varchar', { nullable: false })
    date: string;

    @Column('timestamp', { nullable: false })
    time: string;

    @Column('varchar', { nullable: false })
    description: string;

    @Column('integer', {
        default: 0,
        nullable: false,
        comment: '0-PENDING, 1-INPROGRESS, 2-COMPLETED',
    })
    isCheckListCompleted: number;

    @Column('varchar', { nullable: false })
    jobId: string;

    @Column('timestamp', { nullable: false })
    createdOn: Date;

    @Column('timestamp', { nullable: true })
    updatedOn: Date;

    @ManyToMany(() => Job)
    @JoinColumn()
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
