import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Channel } from 'src/channel/channel.entity';

@Entity()
export class Action {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
    channel: Channel;

    @ManyToOne(() => User)
    user: User;

    @Column()
    type: string;

    @Column({type: 'timestamp'})
    until: Date;
}
