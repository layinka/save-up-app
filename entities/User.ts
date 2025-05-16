import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: number; // This will be the Farcaster FID

  @Property({nullable: true})
  username: string;

  @Property({nullable: true})
  displayName: string;

  @Property({nullable: true})
  profilePictureUrl: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(
    id: number,
    username: string,
    displayName: string,
    profilePictureUrl: string
  ) {
    this.id = id;
    this.username = username;
    this.displayName = displayName;
    this.profilePictureUrl = profilePictureUrl;
  }
}
