import { Entity, PrimaryKey, Property, OptionalProps, types } from '@mikro-orm/core';

@Entity({ tableName: 'challenges' }) // Explicitly set table name if needed
export class Challenge {

  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'currentAmount' | 'participantsCount' | 'description' | 'creatorFid' | 'targetDate';

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

  @Property({ type: types.integer, default: 0 })
  participantsCount: number = 0;

  @Property({ length: 256, nullable: true })
  creatorFid?: string | null; // Farcaster ID

  @Property({ type: 'array' })
  participants: string[] = [];

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  // Constructor (optional but good practice)
  constructor(name: string, goalAmount: number) {
    this.name = name;
    this.goalAmount = goalAmount;
  }
}
