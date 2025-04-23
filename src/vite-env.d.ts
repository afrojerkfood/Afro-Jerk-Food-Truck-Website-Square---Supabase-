/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_MAPS_API_KEY: string
  readonly VITE_SQUARE_ACCESS_TOKEN: string
  readonly VITE_SQUARE_LOCATION_ID: string
  readonly VITE_SQUARE_WEBHOOK_SIGNATURE_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}