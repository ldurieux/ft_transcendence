import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: false})
    inGame: boolean;

    @Column()
    games: {friend: User, score: {myScore: number, friendScore: number}, win: boolean}[];

    @Column()
    Wins: number;

    @Column()
    Losses: number;
}
