import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Chats } from './Chats';
import { UserProfile } from './UserProfile';

@Entity()
export class ChatMessages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  chatId: string;

  @Column('varchar', { nullable: false })
  message: string;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => UserProfile, { eager: true })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'userId' })
  userProfile: UserProfile;

  @ManyToOne(() => Chats)
  @JoinColumn({ name: 'chat_id' })
  chats: Chats;

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
