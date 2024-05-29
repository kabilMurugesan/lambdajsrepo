import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    JoinColumn,
    ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Team } from './Team';
import { Job } from './Job';

@Entity()
export class JobGuardCoordinates {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { nullable: false })
    jobId: string;

    @Column('varchar', { nullable: false })
    userId: string;

    @Column('varchar', { nullable: true })
    teamId: string;

    @Column('varchar', { nullable: false })
    guardCoordinates: string;

    @Column('varchar', { nullable: false, default: false })
    isGuardWithInRadius: boolean;

    @Column('varchar', { nullable: true })
    createdBy: string;

    @Column('timestamp', { nullable: true })
    createdOn: Date;

    @Column('varchar', { nullable: true })
    updatedBy: string;

    @Column('timestamp', { nullable: true })
    updatedOn: Date;

    @ManyToOne(() => Job)
    @JoinColumn({ name: 'job_id' })
    job: Job;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Team)
    @JoinColumn({ name: 'team_id' })
    team: Team;

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
