import { cn } from "@/lib/utils";
import { Simbolo } from "./Simbolo";

type LogoProps = {
  /** Lado do símbolo em pixels. O texto acompanha na proporção da identidade visual. */
  tamanho?: number;
  className?: string;
};

/** Logo horizontal: símbolo à esquerda e "eachpedia" em Space Grotesk 500. */
export function Logo({ tamanho = 36, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-grafite", className)}>
      <Simbolo tamanho={tamanho} />
      <span
        className="font-display leading-none font-medium tracking-logo"
        style={{ fontSize: Math.round(tamanho * 0.66) }}
      >
        eachpedia
      </span>
    </span>
  );
}
