import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ChatMessages } from './ChatMessages';
import { UserProfile } from './UserProfile';

@Entity()
export class ChatMessageRecipients {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { nullable: false })
  chatMessageId: string;

  @Column('varchar', { nullable: false })
  userId: string;

  @Column('varchar', { nullable: true })
  createdBy: string;

  @Column('timestamp', { nullable: true })
  createdOn: Date;

  @Column('varchar', { nullable: true })
  updatedBy: string;

  @Column('timestamp', { nullable: true })
  updatedOn: Date;

  @ManyToOne(() => UserProfile, { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  userProfile: UserProfile;

  @ManyToOne(() => ChatMessages)
  @JoinColumn({ name: 'chat_message_id' })
  chatMessages: ChatMessages;

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
