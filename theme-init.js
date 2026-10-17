try {
  const theme = localStorage.getItem("theme") === "dark" ? "dark" : "light";
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
} catch {
  /* The default is light when preferences are unavailable. */
}
