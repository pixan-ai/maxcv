import { readFileSync } from "fs";
import { join } from "path";

function loadPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "src/lib/prompts", `${name}.txt`), "utf-8");
}

// Prompts are read once at build time thanks to the bundler
export const SCORE_PROMPT = loadPrompt("score");
export const IMPROVE_PROMPT = loadPrompt("improve");
