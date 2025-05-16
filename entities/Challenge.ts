import { Entity, PrimaryKey, Property, OptionalProps, ManyToOne, ManyToMany, Collection, types, OneToMany } from '@mikro-orm/core';
import { User } from './User';
import { Participant } from './Participant';

@Entity({ tableName: 'challenges' }) // Explicitly set table name if needed
export class Challenge {

  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'currentAmount' |  'description' | 'targetDate' | 'transactionHash';

  @PrimaryKey({ autoincrement: false })
  id!: number; 

  @Property({ length: 256 })
  name!: string;

  @Property({ type: 'text', nullable: true })
  description?: string | null;

  @Property({ type: types.decimal, columnType: 'decimal(14,2)', nullable: false })
  goalAmount!: number; // Store in cents

  @Property({ type: types.decimal, columnType: 'decimal(14,2)', default: 0 })
  currentAmount: number = 0; // Store in cents

  @Property({ type: types.datetime, nullable: true })
  targetDate?: Date | null;

  // @Property({ type: types.integer })
  // creatorId: number;

  // @ManyToOne(() => User, { mapToPk: true })
  // creator!: User;
  @ManyToOne(() => User)
  creator!: User;

  @Property({ type: types.decimal, default: 0 })
  totalAmountContributed: number = 0;
  
  @Property({ type: 'string', length: 66, nullable: true })
  transactionHash?: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // @OneToMany(() => Participant, (participant) => participant.challenge)
  // participants = new Collection<Participant>(this);


  // Constructor (optional but good practice)
  constructor(name: string, goalAmount: number) {
    this.name = name;
    this.goalAmount = goalAmount;
  }
}
