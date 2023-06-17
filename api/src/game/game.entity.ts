import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, OneToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => User)
    myEnemy: User;

    @Column({default: 0})
    myScore: number;

    @Column({default: 0})
    enemyScore: number;

    @Column({default: false})
    Win: boolean;
}
