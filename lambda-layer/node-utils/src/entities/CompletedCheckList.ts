import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BeforeInsert,
    BeforeUpdate,
    JoinColumn,
    ManyToMany,
} from 'typeorm';
import { checkList } from './CheckList';
// import { User } from './User';

@Entity()
export class completedCheckList {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('varchar', { nullable: false })
    userId: string;

    @Column('varchar', { nullable: false })
    checkListId: string;

    @Column('timestamp', { nullable: false })
    createdOn: Date;

    @Column('timestamp', { nullable: true })
    updatedOn: Date;

    @ManyToMany(() => checkList)
    @JoinColumn()
    checkList: checkList;

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
