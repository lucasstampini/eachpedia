import type { Metadata } from "next";
import Link from "next/link";

import { Simbolo } from "@/components/marca/Simbolo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-[1240px] flex-col items-start gap-5 px-4 py-20 sm:px-7 md:py-28">
      <Simbolo tamanho={72} traco />
      <span className="rotulo">Erro 404</span>
      <h1 className="text-4xl sm:text-5xl">Essa página ainda não existe</h1>
      <p className="max-w-xl text-lg leading-relaxed text-cinza-700">
        O Eachpedia está em construção e algumas áreas ainda não abriram. Se você chegou aqui por um
        link do próprio site, é só questão de tempo.
      </p>
      <Button asChild>
        <Link href="/">Voltar pro início</Link>
      </Button>
    </section>
  );
}
