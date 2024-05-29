import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BeforeUpdate,
    BeforeInsert,
} from 'typeorm';

@Entity()
export class Settings {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('varchar', { nullable: false })
    value: string;
    @Column('varchar', { nullable: false })
    type: string;
    @Column('varchar', { nullable: false })
    createdBy: string;
    @Column('timestamp', { nullable: false })
    createdOn: Date;
    @Column('varchar', { nullable: true })
    updatedBy: string;
    @Column('timestamp', { nullable: true })
    updatedOn: Date;

    @BeforeInsert()
    updateCreateDates() {
        this.createdOn = new Date();
        this.updatedOn = new Date();
    }

    @BeforeUpdate()
    updateUpdateDates() {
        this.updatedOn = new Date();
    }
}
