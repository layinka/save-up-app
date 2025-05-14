import { Migration } from '@mikro-orm/migrations';

export class Migration20250514150716 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "user" ("id" serial primary key, "username" varchar(255) null, "display_name" varchar(255) null, "profile_picture_url" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "challenges" ("id" serial primary key, "name" varchar(256) not null, "description" text null, "goal_amount" decimal(14,2) not null, "current_amount" decimal(14,2) not null default 0, "target_date" timestamptz null, "creator_id" int not null, "total_amount_contributed" numeric(10,0) not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "participant" ("user_id" int not null, "challenge_id" int not null, "amount_contributed" numeric(10,0) not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "participant_pkey" primary key ("user_id", "challenge_id"));`);

    this.addSql(`alter table "challenges" add constraint "challenges_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "participant" add constraint "participant_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "participant" add constraint "participant_challenge_id_foreign" foreign key ("challenge_id") references "challenges" ("id") on update cascade;`);
  }

}
