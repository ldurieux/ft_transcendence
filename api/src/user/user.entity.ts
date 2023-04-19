import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({default: null})
  profile_picture: string | null;

  @Column({default: null})
  intra_token: string | null;

  @Column({default: null})
  pass_hash: string | null;

  @Column({default: 1000})
  elo: number;
}
