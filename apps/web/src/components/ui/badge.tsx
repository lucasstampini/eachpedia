import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex w-fit items-center whitespace-nowrap", {
  variants: {
    variant: {
      /** Sigla de disciplina, ex.: ACH2036. */
      sigla: "rounded-chip bg-vermelho-50 px-2.5 py-1.5 font-mono text-[15px] text-vermelho-800",
      /** Selo de destaque, ex.: "Revisado pelos curadores". */
      selo: "rounded-full bg-amarelo-100 px-2.5 py-1.5 text-[13px] font-semibold text-grafite",
      /** Metadado neutro, ex.: créditos ou semestre ideal. */
      contorno: "rounded-full border border-cinza-300 px-3 py-1.5 text-sm text-cinza-700",
    },
  },
  defaultVariants: {
    variant: "contorno",
  },
});

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
