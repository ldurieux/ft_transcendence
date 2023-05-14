import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Message } from 'src/message/message.entity';

@Entity()
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: null})
    display_name: string;

    @Column({default: 'public'})
    type: string;

    @Column({default: null})
    password_hash: string;

    @ManyToOne(() => User)
    owner: User;
  
    @ManyToMany(() => User)
    @JoinTable()
    admins: User[];
  
    @ManyToMany(() => User)
    @JoinTable()
    users: User[];

    @OneToMany(() => Message, (message) => message.channel)
    messages: Message[];
}