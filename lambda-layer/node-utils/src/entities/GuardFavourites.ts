import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import { UserProfile } from './UserProfile';

@Entity()
export class FavoriteGuard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { nullable: false })
    guardId: string;

    @Column('varchar', { nullable: false })
    userId: string;

    @Column('boolean', { nullable: false, default: true })
    isFavorite: boolean;

    @Column('varchar', { nullable: true })
    createdBy: string;

    @Column('timestamp', { nullable: true })
    createdOn: Date;

    @Column('varchar', { nullable: true })
    updatedBy: string;

    @Column('timestamp', { nullable: true })
    updatedOn: Date;

    @ManyToOne(() => UserProfile, { nullable: false })
    @JoinColumn({ name: 'guard_id', referencedColumnName: 'userId' })
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
