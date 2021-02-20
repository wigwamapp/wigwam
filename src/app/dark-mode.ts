const root = document.documentElement;

export function toggleDarkMode() {
  if (root.classList.contains("dark")) {
    localStorage.theme = "light";
    root.classList.remove("dark");
  } else {
    localStorage.theme = "dark";
    root.classList.add("dark");
  }
}
