("dark" !== localStorage.theme &&
  ("theme" in localStorage ||
    !window.matchMedia("(prefers-color-scheme: dark)").matches)) ||
  document.documentElement.classList.add("dark");
