import { Entity, ManyToOne, PrimaryKey, Property, types } from '@mikro-orm/core';
import { User } from './User';
import { Challenge } from './Challenge';

@Entity()
export class Participant {
  @PrimaryKey()
  userId!: number; // This will be the Farcaster FID

  @PrimaryKey()
  challengeId!: number;

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Challenge)
  challenge!: Challenge;

  @Property({ type: types.decimal })
  amountContributed: number = 0;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    userId: number,
    challengeId: number,
    amountContributed: number = 0
  ) {
    this.userId = userId;
    this.challengeId = challengeId;
    this.amountContributed = amountContributed;
  }
}
