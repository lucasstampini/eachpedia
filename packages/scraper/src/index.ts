export {
  CODIGO_UNIDADE_EACH,
  INTERVALO_MINIMO_MS,
  URL_JUPITERWEB,
  URL_REPOSITORIO,
  USER_AGENT,
} from "./config.ts";
export { coletar } from "./coletar.ts";
export { gravar, houveMudanca, type Diff } from "./gravar.ts";
export { criarCliente } from "./http.ts";
