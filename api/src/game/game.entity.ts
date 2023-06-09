import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Game {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default: 0})
    win: number;

    @Column({default: 0})
    lose: number;

    @Column({default: false})
    in_game: boolean;

    @Column({default: 0})
    score: number;
}
