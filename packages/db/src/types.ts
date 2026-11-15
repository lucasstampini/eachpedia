// Arquivo gerado. Não edite à mão.
// Para atualizar: pnpm supabase gen types typescript --local > packages/db/src/types.ts


export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "blocos_optativas": {
                  Row: {
                    "creditos_minimos": number,"curriculo_id": number,"id": number,"nome": string,"tipo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "creditos_minimos": number,"curriculo_id": number,"id"?: never,"nome": string,"tipo": string
                  }
                  Update: {
                    "creditos_minimos"?: number,"curriculo_id"?: number,"id"?: never,"nome"?: string,"tipo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "blocos_optativas_curriculo_id_fkey"
      columns: ["curriculo_id"]
isOneToOne: false
      referencedRelation: "curriculos"
      referencedColumns: ["id"]
    }
                  ]
                },"curriculo_disciplinas": {
                  Row: {
                    "bloco_id": number | null,"curriculo_id": number,"semestre_ideal": number,"sigla": string,"tipo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bloco_id"?: number | null,"curriculo_id": number,"semestre_ideal": number,"sigla": string,"tipo": string
                  }
                  Update: {
                    "bloco_id"?: number | null,"curriculo_id"?: number,"semestre_ideal"?: number,"sigla"?: string,"tipo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "curriculo_disciplinas_bloco_id_fkey"
      columns: ["bloco_id"]
isOneToOne: false
      referencedRelation: "blocos_optativas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "curriculo_disciplinas_curriculo_id_fkey"
      columns: ["curriculo_id"]
isOneToOne: false
      referencedRelation: "curriculos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "curriculo_disciplinas_sigla_fkey"
      columns: ["sigla"]
isOneToOne: false
      referencedRelation: "disciplinas"
      referencedColumns: ["sigla"]
    }
                  ]
                },"curriculos": {
                  Row: {
                    "ano_inicio": number,"atualizado_em": string,"ch_estagio": number | null,"ch_extensao": number | null,"ch_obrigatoria_aula": number,"ch_obrigatoria_trabalho": number,"ch_optativa_eletiva_aula": number,"ch_optativa_eletiva_trabalho": number,"ch_optativa_livre_aula": number,"ch_optativa_livre_trabalho": number,"content_hash": string,"curso_id": number,"duracao_ideal": number,"duracao_maxima": number,"duracao_minima": number,"id": number,"versao": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ano_inicio": number,"atualizado_em"?: string,"ch_estagio"?: number | null,"ch_extensao"?: number | null,"ch_obrigatoria_aula": number,"ch_obrigatoria_trabalho": number,"ch_optativa_eletiva_aula": number,"ch_optativa_eletiva_trabalho": number,"ch_optativa_livre_aula": number,"ch_optativa_livre_trabalho": number,"content_hash": string,"curso_id": number,"duracao_ideal": number,"duracao_maxima": number,"duracao_minima": number,"id"?: never,"versao": string
                  }
                  Update: {
                    "ano_inicio"?: number,"atualizado_em"?: string,"ch_estagio"?: number | null,"ch_extensao"?: number | null,"ch_obrigatoria_aula"?: number,"ch_obrigatoria_trabalho"?: number,"ch_optativa_eletiva_aula"?: number,"ch_optativa_eletiva_trabalho"?: number,"ch_optativa_livre_aula"?: number,"ch_optativa_livre_trabalho"?: number,"content_hash"?: string,"curso_id"?: number,"duracao_ideal"?: number,"duracao_maxima"?: number,"duracao_minima"?: number,"id"?: never,"versao"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "curriculos_curso_id_fkey"
      columns: ["curso_id"]
isOneToOne: false
      referencedRelation: "cursos"
      referencedColumns: ["id"]
    }
                  ]
                },"cursos": {
                  Row: {
                    "atualizado_em": string,"codigo": number,"content_hash": string,"habilitacao": number,"id": number,"nome": string,"periodo": string,"unidade": number
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"codigo": number,"content_hash": string,"habilitacao": number,"id"?: never,"nome": string,"periodo": string,"unidade": number
                  }
                  Update: {
                    "atualizado_em"?: string,"codigo"?: number,"content_hash"?: string,"habilitacao"?: number,"id"?: never,"nome"?: string,"periodo"?: string,"unidade"?: number
                  }
                  Relationships: [
                    
                  ]
                },"disciplina_docentes": {
                  Row: {
                    "docente_id": number,"sigla": string
                  }
                  ComputedFields: never
                  Insert: {
                    "docente_id": number,"sigla": string
                  }
                  Update: {
                    "docente_id"?: number,"sigla"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "disciplina_docentes_docente_id_fkey"
      columns: ["docente_id"]
isOneToOne: false
      referencedRelation: "docentes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "disciplina_docentes_sigla_fkey"
      columns: ["sigla"]
isOneToOne: false
      referencedRelation: "disciplinas"
      referencedColumns: ["sigla"]
    }
                  ]
                },"disciplinas": {
                  Row: {
                    "atualizado_em": string,"carga_horaria": number,"content_hash": string,"creditos_aula": number,"creditos_trabalho": number,"ementa": string,"nome": string,"objetivos": string,"programa": string,"sigla": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"carga_horaria": number,"content_hash": string,"creditos_aula": number,"creditos_trabalho": number,"ementa"?: string,"nome": string,"objetivos"?: string,"programa"?: string,"sigla": string
                  }
                  Update: {
                    "atualizado_em"?: string,"carga_horaria"?: number,"content_hash"?: string,"creditos_aula"?: number,"creditos_trabalho"?: number,"ementa"?: string,"nome"?: string,"objetivos"?: string,"programa"?: string,"sigla"?: string
                  }
                  Relationships: [
                    
                  ]
                },"docentes": {
                  Row: {
                    "departamento": string | null,"id": number,"nome": string,"numero_usp": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "departamento"?: string | null,"id"?: never,"nome": string,"numero_usp"?: number | null
                  }
                  Update: {
                    "departamento"?: string | null,"id"?: never,"nome"?: string,"numero_usp"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"requisitos": {
                  Row: {
                    "curriculo_id": number,"grupo": number,"sigla": string,"sigla_requisito": string,"tipo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "curriculo_id": number,"grupo"?: number,"sigla": string,"sigla_requisito": string,"tipo": string
                  }
                  Update: {
                    "curriculo_id"?: number,"grupo"?: number,"sigla"?: string,"sigla_requisito"?: string,"tipo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "requisitos_curriculo_id_fkey"
      columns: ["curriculo_id"]
isOneToOne: false
      referencedRelation: "curriculos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requisitos_sigla_fkey"
      columns: ["sigla"]
isOneToOne: false
      referencedRelation: "disciplinas"
      referencedColumns: ["sigla"]
    },{
      foreignKeyName: "requisitos_sigla_requisito_fkey"
      columns: ["sigla_requisito"]
isOneToOne: false
      referencedRelation: "disciplinas"
      referencedColumns: ["sigla"]
    }
                  ]
                },"scraper_runs": {
                  Row: {
                    "diff": Json | null,"erro": string | null,"fim": string | null,"id": number,"inicio": string,"status": string
                  }
                  ComputedFields: never
                  Insert: {
                    "diff"?: Json | null,"erro"?: string | null,"fim"?: string | null,"id"?: never,"inicio"?: string,"status"?: string
                  }
                  Update: {
                    "diff"?: Json | null,"erro"?: string | null,"fim"?: string | null,"id"?: never,"inicio"?: string,"status"?: string
                  }
                  Relationships: [
                    
                  ]
                },"turmas": {
                  Row: {
                    "atualizado_em": string,"codigo_turma": string,"content_hash": string,"docente_ids": (number)[],"horarios": NonNullable<Json>,"id": number,"semestre": string,"sigla": string
                  }
                  ComputedFields: never
                  Insert: {
                    "atualizado_em"?: string,"codigo_turma": string,"content_hash": string,"docente_ids"?: (number)[],"horarios"?: NonNullable<Json>,"id"?: never,"semestre": string,"sigla": string
                  }
                  Update: {
                    "atualizado_em"?: string,"codigo_turma"?: string,"content_hash"?: string,"docente_ids"?: (number)[],"horarios"?: NonNullable<Json>,"id"?: never,"semestre"?: string,"sigla"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "turmas_sigla_fkey"
      columns: ["sigla"]
isOneToOne: false
      referencedRelation: "disciplinas"
      referencedColumns: ["sigla"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            [_ in never]: never
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
