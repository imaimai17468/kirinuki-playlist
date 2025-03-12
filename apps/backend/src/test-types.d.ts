import type { Bindings } from "./types";

declare global {
  function getMiniflareBindings(): Promise<Bindings>;
}
