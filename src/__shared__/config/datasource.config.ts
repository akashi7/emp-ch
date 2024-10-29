import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const datasourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrationsTableName: 'migrations',
  migrations: ['dist/_migrations/*{.ts,.js}'],
};

export default new DataSource(datasourceConfig);
