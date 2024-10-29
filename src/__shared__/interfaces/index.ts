export interface IAppConfig {
  port?: number;
  env?: any;
  jwt?: JwtConfig;
  mail?: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
}

interface JwtConfig {
  secret: string;
  expiresIn: string;
}
