/* Generated from Appearance.astro. */
const defaultPalette = "krem";

  (() => {
    const root = document.documentElement;
    const palettes = ["krem", "forest", "ocean", "royal", "aurora", "earth"];
    const shared = location.hostname === "irsyads.com" || location.hostname.endsWith(".irsyads.com");
    const media = matchMedia("(prefers-color-scheme: dark)");
    const readLocal = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
    const readThemePreference = () => { try { return localStorage.getItem("irsyads-theme") || "system"; } catch { return undefined; } };
    const writeLocal = (key, value) => { try { if (value === "system") localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {} };
    const readCookie = (key) => { try { return document.cookie.split("; ").find((item) => item.startsWith(key + "="))?.split("=")[1]; } catch { return null; } };
    const writeCookie = (key, value) => {
      if (!shared) return;
      document.cookie = key + "=" + value + "; Path=/; Domain=irsyads.com; Max-Age=31536000; SameSite=Lax; Secure";
    };
    let preference = "system";
    let appliedTheme;
    let appliedPalette;
    function sync() {
      const theme = (shared && readCookie("irsyads-appearance-theme")) || readLocal("irsyads-theme") || "system";
      preference = ["light", "dark"].includes(theme) ? theme : "system";
      const palette = (shared && readCookie("irsyads-appearance-palette")) || readLocal("irsyads-palette") || defaultPalette;
      appliedTheme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
      appliedPalette = palettes.includes(palette) ? palette : "krem";
      root.dataset.theme = appliedTheme;
      if (appliedPalette === "krem") delete root.dataset.palette; else root.dataset.palette = appliedPalette;
      writeLocal("irsyads-theme", preference);
      writeLocal("irsyads-palette", appliedPalette);
      writeCookie("irsyads-appearance-theme", preference);
      writeCookie("irsyads-appearance-palette", appliedPalette);
    }
    sync();
    // Standalone adapters can set an explicit preference even when storage is blocked.
    window.addEventListener("irsyads-appearance-change", (event) => {
      const next = event.detail || {};
      if (["system", "light", "dark"].includes(next.theme)) {
        preference = next.theme;
        appliedTheme = preference === "system" ? (media.matches ? "dark" : "light") : preference;
        writeLocal("irsyads-theme", preference);
        writeCookie("irsyads-appearance-theme", preference);
        root.dataset.theme = appliedTheme;
      }
      if (palettes.includes(next.palette)) {
        appliedPalette = next.palette;
        writeLocal("irsyads-palette", appliedPalette);
        writeCookie("irsyads-appearance-palette", appliedPalette);
        root.dataset.palette = appliedPalette;
      }
    });
    new MutationObserver(() => {
      const theme = root.dataset.theme;
      const palette = root.dataset.palette || "krem";
      const storedPreference = readThemePreference();
      if ((theme !== appliedTheme || (storedPreference ?? preference) !== preference) && ["light", "dark"].includes(theme)) {
        // Existing controls update dataset and storage in the same task.
        preference = storedPreference === "system" ? "system" : theme;
        appliedTheme = theme;
        writeCookie("irsyads-appearance-theme", preference);
      }
      if (palette !== appliedPalette && palettes.includes(palette)) {
        appliedPalette = palette;
        writeLocal("irsyads-palette", palette);
        writeCookie("irsyads-appearance-palette", palette);
      }
    }).observe(root, { attributes: true, attributeFilter: ["data-theme", "data-palette"] });
    media.addEventListener("change", () => {
      if (preference === "system") { appliedTheme = media.matches ? "dark" : "light"; root.dataset.theme = appliedTheme; }
    });
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);
    window.addEventListener("storage", (event) => {
      if (event.key === "irsyads-theme" || event.key === "irsyads-palette") {
        writeCookie(event.key === "irsyads-theme" ? "irsyads-appearance-theme" : "irsyads-appearance-palette", event.newValue || (event.key === "irsyads-theme" ? "system" : "krem"));
        sync();
      }
    });
  })();
