import { Entity, PrimaryKey, Property, OptionalProps, ManyToOne, ManyToMany, Collection, types } from '@mikro-orm/core';
import { User } from './User';

@Entity({ tableName: 'challenges' }) // Explicitly set table name if needed
export class Challenge {

  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'currentAmount' | 'participantsCount' | 'description' | 'targetDate';

  @PrimaryKey()
  id!: number; // Auto-incrementing primary key by default

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

  @Property({ type: types.integer })
  creatorId: number;

  @ManyToOne(() => User)
  creator!: User;


  @Property({ type: types.decimal, default: 0 })
  totalAmountContributed: number = 0;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Constructor (optional but good practice)
  constructor(name: string, goalAmount: number, creatorId: number) {
    this.name = name;
    this.goalAmount = goalAmount;
    this.creatorId = creatorId;
  }
}
