import { Migration } from '@mikro-orm/migrations';

export class Migration20250515183511_challenge_id_no_increment extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "challenges" alter column "id" type int using ("id"::int);`);
    this.addSql(`alter table "challenges" alter column "id" drop default;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "challenges" alter column "id" type int using ("id"::int);`);
    this.addSql(`create sequence if not exists "challenges_id_seq";`);
    this.addSql(`select setval('challenges_id_seq', (select max("id") from "challenges"));`);
    this.addSql(`alter table "challenges" alter column "id" set default nextval('challenges_id_seq');`);
  }

}
