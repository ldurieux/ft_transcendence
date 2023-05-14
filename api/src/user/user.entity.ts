import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { Auth } from '../auth/auth.entity'
import { FriendRequest } from 'src/friend-request/friend-request.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  display_name: string;

  @Column({default: null})
  profile_picture: string | null;

  @OneToMany(() => Auth, (auth) => auth.user)
  auths: Auth[];

  @ManyToMany(() => User, user => user.friends)
  @JoinTable()
  friends: User[];

  @OneToMany(() => FriendRequest, (request) => request.requester)
  sentRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (request) => request.receiver)
  receivedRequests: FriendRequest[];

  @ManyToMany(() => User, (user) => user.id)
  @JoinTable()
  blocked: User[];

  @Column({default: 0})
  points: number;
}
