import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Auth } from '../auth/auth.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  display_name: string;

  @Column({default: null})
  profile_picture: string | null;

  @OneToMany(() => Auth, (auth) => auth.user)
  auths: Auth[]
}
