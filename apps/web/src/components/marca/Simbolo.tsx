import { cn } from "@/lib/utils";

const CORES = {
  vermelho: "text-vermelho",
  amarelo: "text-amarelo",
  branco: "text-white",
  /** Herda a cor do texto ao redor. */
  atual: "",
} as const;

type SimboloProps = {
  /** Lado do símbolo em pixels. Funciona até 16. */
  tamanho?: number;
  cor?: keyof typeof CORES;
  /** Versão só com contorno, para usos decorativos. */
  traco?: boolean;
  /** Descrição para leitores de tela. Sem ela, o símbolo é tratado como decoração. */
  titulo?: string;
  className?: string;
};

/**
 * Símbolo do Eachpedia: o touro da atlética reduzido a três polígonos de linhas retas.
 * Os pontos vêm da identidade visual (docs/identidade-visual.md). Não altere.
 */
export function Simbolo({
  tamanho = 36,
  cor = "vermelho",
  traco = false,
  titulo,
  className,
}: SimboloProps) {
  const acessibilidade = titulo
    ? ({ role: "img", "aria-label": titulo } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <svg
      viewBox="0 0 120 120"
      width={tamanho}
      height={tamanho}
      className={cn("shrink-0", CORES[cor], className)}
      {...acessibilidade}
    >
      <g
        fill={traco ? "none" : "currentColor"}
        stroke={traco ? "currentColor" : undefined}
        strokeWidth={traco ? 2.5 : undefined}
        strokeLinejoin="miter"
      >
        <polygon points="44,46 30,40 22,18 28,18 35,34 52,46" />
        <polygon points="76,46 90,40 98,18 92,18 85,34 68,46" />
        <polygon points="44,46 76,46 70,84 64,94 56,94 50,84" />
      </g>
    </svg>
  );
}
