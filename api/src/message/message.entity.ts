import { Entity, Column, PrimaryGeneratedColumn, JoinTable, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Channel } from 'src/channel/channel.entity';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Channel)
    channel: Channel;

    @ManyToOne(() => User)
    owner: User;

    @Column()
    text: string;

    @Column({type: 'timestamp'})
    created_at: Date;
}