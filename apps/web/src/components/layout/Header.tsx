import Link from "next/link";

import { Logo } from "@/components/marca/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAVEGACAO = [
  { href: "/cursos", texto: "Cursos" },
  { href: "/quanto-falta", texto: "Quanto falta" },
  { href: "/montar-grade", texto: "Montar grade" },
  { href: "/ics", texto: "ICs" },
] as const;

/**
 * Cabeçalho do site. No celular quebra em três linhas:
 * logo e entrar, depois a navegação, depois a busca.
 */
export function Header() {
  return (
    <header className="border-b border-cinza-200 bg-superficie">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-7 gap-y-2 px-4 py-3 sm:px-7">
        <Link href="/" aria-label="Eachpedia, página inicial" className="flex h-11 items-center">
          <Logo />
        </Link>

        <nav
          aria-label="Principal"
          className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto text-[15px] font-medium lg:order-none lg:mx-0 lg:w-auto lg:gap-3"
        >
          {NAVEGACAO.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex h-11 items-center px-1.5 whitespace-nowrap text-grafite hover:text-vermelho-700"
            >
              {item.texto}
            </Link>
          ))}
        </nav>

        <form
          action="/busca"
          role="search"
          className="order-4 w-full lg:order-none lg:w-auto lg:flex-1"
        >
          <label htmlFor="busca" className="sr-only">
            Buscar disciplina
          </label>
          <Input
            id="busca"
            name="q"
            type="search"
            placeholder="Busque uma disciplina, ex.: ACH2036"
          />
        </form>

        <Button asChild className="ml-auto lg:ml-0">
          <Link href="/entrar">
            <span className="sm:hidden">Entrar</span>
            <span className="hidden sm:inline">Entrar com e-mail USP</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
