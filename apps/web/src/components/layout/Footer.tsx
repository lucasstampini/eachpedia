import { Simbolo } from "@/components/marca/Simbolo";

const URL_REPOSITORIO = "https://github.com/eachpedia/eachpedia";

export function Footer() {
  return (
    <footer className="border-t border-cinza-200 bg-superficie">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-4 py-8 text-sm text-cinza-700 sm:px-7 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Simbolo tamanho={28} className="mt-0.5" />
          <p className="max-w-md leading-relaxed">
            Feito por alunos da EACH, aberto pra todo mundo. O Eachpedia não é um sistema oficial da
            USP.
          </p>
        </div>
        <p className="leading-relaxed">
          Código sob licença MIT, conteúdo sob CC BY-SA 4.0.{" "}
          <a href={URL_REPOSITORIO} className="link-texto">
            Ver no GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
