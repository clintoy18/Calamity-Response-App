/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_AWS_BASE_URL: string;
  // add more VITE_XXX variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
