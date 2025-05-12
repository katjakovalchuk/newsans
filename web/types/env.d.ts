declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    REDIS_WRITE_URL?: string;
    REDIS_READ_URL?: string;
    NEXT_PUBLIC_APP_URL?: string;
  }
} 