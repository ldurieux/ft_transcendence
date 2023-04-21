import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm'
import { User } from '../user/user.entity'

@Entity()
export class FriendRequest {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.sentRequests)
    requester: User;

    @ManyToOne(() => User, user => user.receivedRequests)
    receiver: User;
}