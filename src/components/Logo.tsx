type LogoProps = {
  /** `onDark` = white wordmark (covers). `onLight` = ink wordmark (pages/UI). */
  theme?: "onDark" | "onLight";
  className?: string;
};

export function Logo({ theme = "onLight", className }: LogoProps) {
  const src =
    theme === "onDark" ? "/nizek-logo-white.svg" : "/nizek-logo.svg";
  return (
    <img
      src={src}
      alt="nizek"
      className={["nizek-logo", className].filter(Boolean).join(" ")}
    />
  );
}
