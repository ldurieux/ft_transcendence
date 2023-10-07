import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.game)
    user: User;

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
