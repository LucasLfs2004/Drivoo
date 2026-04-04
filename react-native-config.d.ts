declare module 'react-native-config' {
  export interface NativeConfig {
    API_BASE_URL?: string;
    API_TIMEOUT?: string;
    LOG_REQUESTS?: string;
    SUPABASE_URL?: string;
    SUPABASE_ANON_KEY?: string;
  }

  const Config: NativeConfig;
  export default Config;
}
