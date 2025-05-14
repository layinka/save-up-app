import { Migration } from '@mikro-orm/migrations';

export class Migration20250514093907 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "challenges" ("id" serial primary key, "name" varchar(256) not null, "description" text null, "goal_amount" decimal(14,2) not null, "current_amount" decimal(14,2) not null default 0, "target_date" timestamptz null, "participants_count" int not null default 0, "creator_fid" varchar(256) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
  }

}
