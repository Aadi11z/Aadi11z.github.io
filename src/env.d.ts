/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_BASE_PATH?: string;
  readonly PUBLIC_INTRO_MODE?: 'normal' | 'design';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
