export type ThemeMode = "light" | "dark" | "system";

export function getThemeMode(): ThemeMode {
  return localStorage.theme ?? "system";
}

export function setThemeMode(theme: ThemeMode) {
  switch (theme) {
    case "dark":
    case "light":
      localStorage.theme = theme;
      break;

    default:
      localStorage.removeItem("theme");
  }
}
