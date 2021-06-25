declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URI: string;
      PORT: string;
      NODE_ENV: "development" | "production";
      JWT_SECRET: string;
      CLIENT_URL: string;
    }
  }
}
export {};
