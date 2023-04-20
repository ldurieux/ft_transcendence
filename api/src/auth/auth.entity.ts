import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../user/user.entity'

@Entity()
export class Auth {
    @PrimaryColumn()
    method: string;

    @PrimaryColumn()
    username: string;

    @Column('jsonb', {default: null})
    data: Map<string, string>;

    @ManyToOne(() => User, (user) => user.auths)
    user: User;
}