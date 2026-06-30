"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@zkhelios/ui";
import type { ProofTypeDef } from "@/lib/zk/circuits";
import { cn } from "@/lib/utils";

interface Props {
  def: ProofTypeDef;
  defaultValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
}

const inputCls =
  "w-full rounded-md border border-ink-400 bg-ink-900 px-3 py-2 text-body text-paper outline-none placeholder:text-ink-300 focus:border-amber-500/50";

export function ConfigureStep({ def, defaultValues, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(def.schema),
    defaultValues: defaultValues ?? Object.fromEntries(def.fields.map((f) => [f.name, ""])),
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-5">
        {def.fields.map((f) => (
          <div key={f.name}>
            <label className="mb-1.5 flex items-center gap-2 text-caption font-medium text-paper">
              {f.label}
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem]",
                  f.visibility === "public"
                    ? "bg-[#60A5FA]/15 text-[#60A5FA]"
                    : "bg-amber-500/15 text-amber-400",
                )}
              >
                {f.visibility === "public" ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                {f.visibility}
              </span>
            </label>
            {f.kind === "select" ? (
              <select className={inputCls} {...register(f.name)}>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.kind === "textarea" ? (
              <textarea rows={4} className={cn(inputCls, "font-mono text-caption")} placeholder={f.placeholder} {...register(f.name)} />
            ) : (
              <input
                type={f.kind === "number" ? "text" : "text"}
                inputMode={f.kind === "number" ? "decimal" : "text"}
                className={inputCls}
                placeholder={f.placeholder}
                {...register(f.name)}
              />
            )}
            {f.help && !errors[f.name] && <p className="mt-1 text-[0.7rem] text-paper-faint">{f.help}</p>}
            {errors[f.name] && (
              <p className="mt-1 text-[0.7rem] text-status-error">{String(errors[f.name]?.message)}</p>
            )}
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-lg border border-ink-400 bg-ink-900 p-4">
        <h4 className="font-mono text-caption uppercase tracking-wider text-paper-faint">What&apos;s revealed</h4>
        <ul className="mt-3 space-y-2 text-caption">
          {def.fields.map((f) => (
            <li key={f.name} className="flex items-center gap-2">
              {f.visibility === "public" ? (
                <Eye className="size-3.5 text-[#60A5FA]" />
              ) : (
                <EyeOff className="size-3.5 text-amber-400" />
              )}
              <span className="text-paper-muted">{f.label.replace(/ \((public|private)\)$/, "")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-ink-400 pt-3 text-[0.7rem] text-paper-faint">
          Private inputs never leave your browser — only the proof + public inputs are submitted.
        </p>
        <Button type="submit" className="mt-4 w-full">
          Review proof
        </Button>
      </aside>
    </form>
  );
}
