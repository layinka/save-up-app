import { Entity, ManyToOne, PrimaryKey, Property, types } from '@mikro-orm/core';
import { User } from './User';
import { Challenge } from './Challenge';

@Entity({ tableName: 'participants' })
export class Participant {
  @ManyToOne(() => User, { primary: true })
  user!: User;

  @ManyToOne(() => Challenge, { primary: true })
  challenge!: Challenge;


  @Property({ type: types.decimal })
  amountContributed: number = 0;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();


  constructor(
    // user: User,
    // challenge: Challenge,
    amountContributed: number = 0
  ) {
    // this.user = user;
    // this.challenge = challenge;
    this.amountContributed = amountContributed;
  }
}
