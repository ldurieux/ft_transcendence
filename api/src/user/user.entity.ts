import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Auth } from '../auth/auth.entity'
import { FriendRequest } from 'src/friend-request/friend-request.entity';
import { Game } from 'src/game/game.entity';

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

  @Column({default: false})
  twoFaEnabled: boolean;

  @Column({default: ""})
  twoFaSecret: string;

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

  @OneToMany(() => Game, (game) => game.user)
  game: Game[];

  @Column({default: 0})
  games_played: number;

  @Column({default: 0})
  games_won: number;

  @Column({default: 0})
  games_lost: number;
}
