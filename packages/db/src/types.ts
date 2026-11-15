// Arquivo gerado. Não edite à mão.
// Para atualizar: pnpm supabase gen types typescript --local > packages/db/src/types.ts
// Ainda não há tabelas (elas chegam na Fase 1), por isso o schema está vazio.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
