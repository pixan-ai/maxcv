function ResumeText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed text-ink-700 font-[family-name:var(--font-geist)]">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trimStart();
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("·") || trimmed.startsWith("‣") || trimmed.startsWith("- ");
        if (isBullet) {
          return (
            <p key={i} className="m-0" style={{ paddingLeft: "1.2em", textIndent: "-1.2em" }}>{trimmed}</p>
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
