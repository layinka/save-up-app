import { Migration } from '@mikro-orm/migrations';

export class Migration20250515141442 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "challenges" add column "transaction_hash" varchar(66) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "challenges" drop column "transaction_hash";`);
  }

}
