import Link from "next/link";

import { Simbolo } from "@/components/marca/Simbolo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const FUNCIONALIDADES = [
  {
    area: "Explorar",
    titulo: "Grafo de pré-requisitos",
    descricao:
      "Veja a grade do seu curso como um mapa: o que cada disciplina exige e o que ela destrava.",
  },
  {
    area: "Planejar",
    titulo: "Quanto falta pra formar",
    descricao:
      "Marque o que já cursou e descubra os créditos que faltam, com uma sugestão de plano até a formatura.",
  },
  {
    area: "Planejar",
    titulo: "Montador de grade",
    descricao:
      "Escolha as disciplinas do semestre e veja as combinações de turmas sem choque de horário.",
  },
  {
    area: "Comunidade",
    titulo: "Wiki e roadmaps",
    descricao:
      "Guias de cada curso e disciplina, escritos por alunos e revisados por curadores do próprio curso.",
  },
  {
    area: "Pesquisa",
    titulo: "Mural de ICs",
    descricao: "Vagas de iniciação científica num lugar só. As que vencem somem sozinhas.",
  },
  {
    area: "Comunidade",
    titulo: "Avaliações",
    descricao: "Notas e comentários sobre disciplinas e professores, anônimos e moderados.",
  },
] as const;

const PRINCIPIOS = [
  {
    titulo: "Útil sem login",
    descricao:
      "Grafo, planejador, montador e wiki são públicos. Você só entra se quiser contribuir.",
  },
  {
    titulo: "Feito pra quem não é dev",
    descricao: "Tudo se edita dentro do site. Ninguém precisa saber o que é GitHub pra ajudar.",
  },
  {
    titulo: "Seus dados ficam com você",
    descricao: "O que você marca como cursado fica no seu navegador. Seu histórico nunca sai dele.",
  },
] as const;

export default function Home() {
  return (
    <>
      <section className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 pt-14 pb-16 sm:px-7 md:pt-24 md:pb-24">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rotulo">EACH-USP</span>
          <Badge variant="selo">Em construção</Badge>
        </div>
        <h1 className="max-w-4xl text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
          Tudo que você precisa saber pra se formar na EACH.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-cinza-700">
          Pré-requisitos, quanto falta pra formar, montador de grade e uma wiki mantida por quem já
          passou por isso. De todos os cursos, aberto e gratuito.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/cursos">Ver os cursos</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="#projeto">Conhecer o projeto</a>
          </Button>
        </div>
      </section>

      <section
        aria-labelledby="titulo-funcionalidades"
        className="mx-auto flex max-w-[1240px] flex-col gap-7 px-4 pb-20 sm:px-7"
      >
        <div className="flex flex-col gap-2">
          <span className="rotulo">O que vem por aí</span>
          <h2 id="titulo-funcionalidades" className="text-3xl sm:text-4xl">
            Um lugar só pra planejar o curso inteiro
          </h2>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FUNCIONALIDADES.map((item) => (
            <li key={item.titulo}>
              <Card className="h-full">
                <span className="rotulo">{item.area}</span>
                <CardTitle>{item.titulo}</CardTitle>
                <CardDescription>{item.descricao}</CardDescription>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="projeto"
        aria-labelledby="titulo-projeto"
        className="scroll-mt-6 border-y border-cinza-200 bg-superficie"
      >
        <div className="mx-auto flex max-w-[1240px] flex-col gap-10 px-4 py-16 sm:px-7 md:py-20">
          <div className="flex max-w-2xl flex-col gap-3">
            <span className="rotulo">O projeto</span>
            <h2 id="titulo-projeto" className="text-3xl sm:text-4xl">
              Feito por alunos, pra durar mais que uma turma
            </h2>
            <p className="text-lg leading-relaxed text-cinza-700">
              O Eachpedia é aberto e comunitário. Os dados oficiais vêm das páginas públicas do
              JúpiterWeb. O resto é escrito e revisado por quem estuda aqui.
            </p>
          </div>
          <ul className="grid gap-8 md:grid-cols-3">
            {PRINCIPIOS.map((item) => (
              <li key={item.titulo} className="flex flex-col gap-2 border-t-2 border-grafite pt-4">
                <h3 className="text-xl">{item.titulo}</h3>
                <p className="text-[15px] leading-relaxed text-cinza-700">{item.descricao}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-16 sm:px-7 md:py-20">
        <div className="flex flex-col items-start gap-6 rounded-card bg-amarelo p-8 text-grafite md:flex-row md:items-center md:gap-10 md:p-12">
          <Simbolo tamanho={112} className="hidden md:block" />
          <div className="flex flex-1 flex-col gap-2">
            <h2 className="text-3xl sm:text-4xl">Vai prestar vestibular?</h2>
            <p className="max-w-xl text-lg leading-relaxed">
              As páginas dos cursos também são pra você. Dá pra ver o que se estuda em cada um,
              semestre a semestre, antes de escolher.
            </p>
          </div>
          <Button asChild>
            <Link href="/cursos">Conhecer os cursos</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
