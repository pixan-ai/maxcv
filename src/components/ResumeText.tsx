function ResumeText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed text-ink-700 font-[family-name:var(--font-geist)]">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trimStart();
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("·") || trimmed.startsWith("‣") || trimmed.startsWith("- ");
        if (isBullet) {
          const bulletChar = trimmed.match(/^(•|·|‣|- )/)?.[0] ?? "•";
          const content = trimmed.slice(bulletChar.length).trimStart();
          return (
            <p key={i} className="m-0 ml-4">
              <span className="inline-block w-4 -ml-4 text-ink-400">{bulletChar.trim()}</span>
              {content}
            </p>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-3" />;
        const isHeader = line === line.toUpperCase() && line.trim().length > 2 && /^[A-ZÁÉÍÓÚÑÜ\s&/\-:]+$/.test(line.trim());
        if (isHeader) return <p key={i} className="m-0 font-medium text-ink-900 mt-5 mb-1">{line}</p>;
        return <p key={i} className="m-0">{line}</p>;
      })}
    </div>
  );
}

export { ResumeText };
