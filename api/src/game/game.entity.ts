import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 0})
    opponentId: number;

    @Column({default: null})
    opponentName: string;

    @Column({default: 0})
    myScore: number;

    @Column({default: 0})
    enemyScore: number;

    @Column({default: false})
    Win: boolean;
}
