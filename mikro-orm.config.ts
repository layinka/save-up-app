import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { Migrator } from '@mikro-orm/migrations'; 
import { Challenge } from './entities/Challenge';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set in .env file');
} 

const config = {
  metadataProvider: TsMorphMetadataProvider,
  entities: [Challenge],
  discovery: {
    warnWhenNoEntities: true,
    requireEntitiesArray: true,
  },
  dbName: 'saveup_challenges', // Logical name, or extract from DATABASE_URL if needed
  driver: PostgreSqlDriver,
  clientUrl: process.env.DATABASE_URL,
  // Neon specific settings for serverless environments
  driverOptions: {
    connection: {
      ssl: process.env.NODE_ENV === 'production', // Neon typically requires SSL
    }
  },
  migrations: {
    path: './migrations', // path to the migration files
    pathTs: './migrations', // path to the migration files (source)
    glob: '!(*.d).{js,ts}', // only match JavaScript migration files
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: false, // try disabling foreign keys before running migrations
    allOrNothing: true, // run all migrations in current batch in a transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow running unsafe statements
    emit: 'ts', // generate JavaScript migrations
  },
  // Recommended for development
  debug: process.env.NODE_ENV !== 'production',
  // Ensure the compiled output directory structure matches the source
  // You might need to adjust your tsconfig.json if it doesn't already
  extensions: [Migrator], // <-- Register Migrator extension
  
};

export default config;
