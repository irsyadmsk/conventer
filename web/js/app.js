/**
 * Application Main Controller
 * Muhammad Irsyad Sirojul Khoeir - irsyads.com
 */

const SVGS = {"copy":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-copy\"><rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"></rect><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"></path></svg>","sun":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-sun\"><circle cx=\"12\" cy=\"12\" r=\"4\"></circle><path d=\"M12 2v2\"></path><path d=\"M12 20v2\"></path><path d=\"m4.93 4.93 1.41 1.41\"></path><path d=\"m17.66 17.66 1.41 1.41\"></path><path d=\"M2 12h2\"></path><path d=\"M20 12h2\"></path><path d=\"m6.34 17.66-1.41 1.41\"></path><path d=\"m19.07 4.93-1.41 1.41\"></path></svg>","moon":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"lucide lucide-moon\"><path d=\"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401\"></path></svg>","play":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\" class=\"lucide lucide-play\"><polygon points=\"6 3 20 12 6 21 6 3\"></polygon></svg>","playBack":"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"currentColor\" stroke=\"none\" class=\"lucide lucide-play-reverse\"><polygon points=\"18 3 4 12 18 21 18 3\"></polygon></svg>"};

function showToast(msg) {
  msg = msg || "Tersalin ke clipboard!";
  var toast = document.getElementById("toast");
  if (!toast) return;
  toast.innerHTML = SVGS.copy + " " + msg;
  toast.classList.add("show");
  setTimeout(function() { toast.classList.remove("show"); }, 2000);
}

function copyValue(elementId) {
  var el = document.getElementById(elementId);
  if (!el || !el.value) return;
  navigator.clipboard.writeText(el.value).then(function() {
    showToast();
  }).catch(function() {
    el.select();
    document.execCommand("copy");
    showToast();
  });
}

function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(function() {
    showToast();
  }).catch(function() {
    showToast("Gagal menyalin");
  });
}

document.addEventListener("DOMContentLoaded", function() {
  // Theme Toggle
  var themeToggleBtn = document.getElementById("themeToggleBtn");
  var themeIcon = document.getElementById("themeIcon");
  var themeText = document.getElementById("themeText");
  var html = document.documentElement;

  var savedTheme = localStorage.getItem("irsyads_theme") || "light";
  html.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);

  themeToggleBtn.addEventListener("click", function() {
    var current = html.getAttribute("data-theme");
    var next = current === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("irsyads_theme", next);
    updateThemeButton(next);
  });

  function updateThemeButton(theme) {
    if (theme === "dark") {
      themeIcon.innerHTML = SVGS.sun;
      themeText.innerText = "Light Mode";
    } else {
      themeIcon.innerHTML = SVGS.moon;
      themeText.innerText = "Dark Mode";
    }
  }

  // Palette Picker Logic
  var palettePickerBtn = document.getElementById("palettePickerBtn");
  var palettePopover = document.getElementById("palettePopover");
  var paletteActiveName = document.getElementById("paletteActiveName");
  var paletteOptions = document.querySelectorAll(".palette-option-btn");

  var PALETTE_NAMES = {
    krem: "Krem",
    forest: "Hutan",
    ocean: "Samudra",
    royal: "Senja",
    aurora: "Aurora",
    earth: "Tanah"
  };

  var savedPalette = localStorage.getItem("irsyads-palette") || "krem";
  setPalette(savedPalette);

  function setPalette(pal) {
    if (pal === "krem") {
      delete html.dataset.palette;
    } else {
      html.dataset.palette = pal;
    }
    localStorage.setItem("irsyads-palette", pal);
    if (paletteActiveName && PALETTE_NAMES[pal]) {
      paletteActiveName.innerText = PALETTE_NAMES[pal];
    }
    paletteOptions.forEach(function(opt) {
      if (opt.getAttribute("data-palette") === pal) {
        opt.classList.add("active");
      } else {
        opt.classList.remove("active");
      }
    });
  }

  if (palettePickerBtn && palettePopover) {
    palettePickerBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      var isOpen = palettePopover.classList.toggle("open");
      palettePopover.classList.toggle("show", isOpen);
    });

    paletteOptions.forEach(function(btn) {
      btn.addEventListener("click", function(e) {
        e.stopPropagation();
        var pal = btn.getAttribute("data-palette");
        setPalette(pal);
        palettePopover.classList.remove("open");
        palettePopover.classList.remove("show");
        showToast("Rona warna: " + (PALETTE_NAMES[pal] || pal));
      });
    });

    document.addEventListener("click", function(e) {
      if (!palettePickerBtn.contains(e.target) && !palettePopover.contains(e.target)) {
        palettePopover.classList.remove("open");
        palettePopover.classList.remove("show");
      }
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        palettePopover.classList.remove("open");
        palettePopover.classList.remove("show");
      }
    });
  }

  // Mobile Hamburger Drawer
  var mobileMenuToggle = document.getElementById("mobileMenuToggle");
  var mobileNavDrawer = document.getElementById("mobileNavDrawer");
  var menuIconOpen = document.getElementById("menuIconOpen");
  var menuIconClose = document.getElementById("menuIconClose");

  if (mobileMenuToggle && mobileNavDrawer) {
    mobileMenuToggle.addEventListener("click", function() {
      var isOpen = mobileNavDrawer.classList.toggle("open");
      if (menuIconOpen) menuIconOpen.style.display = isOpen ? "none" : "block";
      if (menuIconClose) menuIconClose.style.display = isOpen ? "block" : "none";
    });

    mobileNavDrawer.querySelectorAll("a").forEach(function(link) {
      link.addEventListener("click", function() {
        mobileNavDrawer.classList.remove("open");
        if (menuIconOpen) menuIconOpen.style.display = "block";
        if (menuIconClose) menuIconClose.style.display = "none";
      });
    });

    document.addEventListener("click", function(e) {
      if (mobileNavDrawer.classList.contains("open")) {
        if (!mobileNavDrawer.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
          mobileNavDrawer.classList.remove("open");
          if (menuIconOpen) menuIconOpen.style.display = "block";
          if (menuIconClose) menuIconClose.style.display = "none";
        }
      }
    });
  }

  // =========================================================================
  // UI Audio Haptics Synthesizer (Micro-clicks Web Audio)
  // =========================================================================
  var uiHapticsEnabled = localStorage.getItem("irsyads_haptics") !== "off";
  var uiSoundToggleBtn = document.getElementById("uiSoundToggleBtn");
  var uiSoundText = document.getElementById("uiSoundText");
  var hapticAudioCtx = null;

  function updateHapticsUI() {
    if (uiSoundText) {
      uiSoundText.innerText = uiHapticsEnabled ? "Haptic: ON" : "Haptic: OFF";
    }
    var soundBars = document.getElementById("soundBarsWrap");
    if (soundBars) {
      if (uiHapticsEnabled) {
        soundBars.classList.add("active");
      } else {
        soundBars.classList.remove("active");
      }
    }
    if (uiSoundToggleBtn) {
      if (uiHapticsEnabled) {
        uiSoundToggleBtn.style.color = "var(--color-accent-ink)";
      } else {
        uiSoundToggleBtn.style.color = "var(--color-muted)";
      }
    }
  }
  updateHapticsUI();

  function playUiClick(freq, duration) {
    if (!uiHapticsEnabled) return;
    try {
      if (!hapticAudioCtx) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) hapticAudioCtx = new AudioCtx();
      }
      if (!hapticAudioCtx) return;
      if (hapticAudioCtx.state === "suspended") hapticAudioCtx.resume();

      var now = hapticAudioCtx.currentTime;
      var osc = hapticAudioCtx.createOscillator();
      var gain = hapticAudioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq || 1000, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + (duration || 0.025));

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (duration || 0.025));

      osc.connect(gain);
      gain.connect(hapticAudioCtx.destination);
      osc.start(now);
      osc.stop(now + (duration || 0.025));
    } catch (e) {}
  }

  if (uiSoundToggleBtn) {
    uiSoundToggleBtn.addEventListener("click", function() {
      uiHapticsEnabled = !uiHapticsEnabled;
      localStorage.setItem("irsyads_haptics", uiHapticsEnabled ? "on" : "off");
      updateHapticsUI();
      if (uiHapticsEnabled) playUiClick(1200, 0.03);
      showToast(uiHapticsEnabled ? "Suara Haptic UI: Aktif" : "Suara Haptic UI: Nonaktif");
    });
  }

  // Attach haptic feedback to buttons and interactive cards
  document.addEventListener("click", function(e) {
    var target = e.target.closest("button, .segment-pill, .dock-item, .soundboard-card, .pedoman-card, .kamus-filter-chip");
    if (target && target !== uiSoundToggleBtn) {
      playUiClick(850, 0.02);
    }
  }, { passive: true });

  // =========================================================================
  // Dynamic Ambient Aurora & Particle Canvas Background
  // =========================================================================
  var ambientCanvas = document.getElementById("ambientCanvas");
  if (ambientCanvas) {
    var actx = ambientCanvas.getContext("2d");
    var aw = 0, ah = 0;
    var particles = [];
    var animFrameId = null;
    var mouseX = -1000, mouseY = -1000;

    function resizeAmbient() {
      aw = ambientCanvas.width = window.innerWidth;
      ah = ambientCanvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      particles = [];
      var count = Math.min(Math.floor((aw * ah) / 30000), 45);
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * aw,
          y: Math.random() * ah,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2.2 + 1.2,
          alpha: Math.random() * 0.4 + 0.15,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    window.addEventListener("resize", resizeAmbient, { passive: true });
    window.addEventListener("mousemove", function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function drawAmbientFrame() {
      if (document.hidden) {
        animFrameId = requestAnimationFrame(drawAmbientFrame);
        return;
      }
      actx.clearRect(0, 0, aw, ah);

      // Silky smooth dynamic aurora mesh (Linear / Apple gradient aesthetic)
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      var t = Date.now() * 0.0004;
      var g1X = aw * 0.3 + Math.sin(t) * aw * 0.18;
      var g1Y = ah * 0.25 + Math.cos(t * 0.7) * ah * 0.15;
      var g2X = aw * 0.7 + Math.cos(t * 0.8) * aw * 0.18;
      var g2Y = ah * 0.65 + Math.sin(t * 0.6) * ah * 0.18;
      var g3X = aw * 0.5 + Math.cos(t * 0.5) * aw * 0.15;
      var g3Y = ah * 0.8 + Math.sin(t * 0.7) * ah * 0.12;

      var grad1 = actx.createRadialGradient(g1X, g1Y, 10, g1X, g1Y, aw * 0.5);
      if (isDark) {
        grad1.addColorStop(0, "rgba(249, 115, 22, 0.055)");
        grad1.addColorStop(1, "rgba(9, 13, 22, 0)");
      } else {
        grad1.addColorStop(0, "rgba(223, 105, 81, 0.04)");
        grad1.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      actx.fillStyle = grad1;
      actx.fillRect(0, 0, aw, ah);

      var grad2 = actx.createRadialGradient(g2X, g2Y, 10, g2X, g2Y, aw * 0.45);
      if (isDark) {
        grad2.addColorStop(0, "rgba(56, 189, 248, 0.045)");
        grad2.addColorStop(1, "rgba(9, 13, 22, 0)");
      } else {
        grad2.addColorStop(0, "rgba(56, 189, 248, 0.03)");
        grad2.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      actx.fillStyle = grad2;
      actx.fillRect(0, 0, aw, ah);

      var grad3 = actx.createRadialGradient(g3X, g3Y, 10, g3X, g3Y, aw * 0.4);
      if (isDark) {
        grad3.addColorStop(0, "rgba(147, 51, 234, 0.035)");
        grad3.addColorStop(1, "rgba(9, 13, 22, 0)");
      } else {
        grad3.addColorStop(0, "rgba(147, 51, 234, 0.02)");
        grad3.addColorStop(1, "rgba(255, 255, 255, 0)");
      }
      actx.fillStyle = grad3;
      actx.fillRect(0, 0, aw, ah);

      animFrameId = requestAnimationFrame(drawAmbientFrame);
    }

    resizeAmbient();
    drawAmbientFrame();
  }

  // =========================================================================
  // Grouped Dropdown Navigation Logic (Aksara, Code, Barcode dll)
  // =========================================================================
  var tabPanels = document.querySelectorAll(".tab-panel");
  var navDropdowns = document.querySelectorAll(".nav-dropdown");
  var dropdownToggles = document.querySelectorAll(".nav-dropdown-toggle");
  var dropdownItems = document.querySelectorAll(".nav-dropdown-item");
  var mobileSelectTool = document.getElementById("mobileSelectTool");
  var activeToolBreadcrumb = document.getElementById("activeToolBreadcrumb");

  var TOOL_META = {
    sundaTab: { group: "aksara", groupName: "Aksara Sunda", toolName: "Pangalihtulis" },
    kamusTab: { group: "aksara", groupName: "Aksara Sunda", toolName: "Kamus Sunda" },
    pedomanTab: { group: "aksara", groupName: "Aksara Sunda", toolName: "Pedoman & Tabel" },
    morseTab: { group: "code", groupName: "Kode & Kripto", toolName: "Morse Studio" },
    codecTab: { group: "code", groupName: "Kode & Kripto", toolName: "Codec & Encoders" },
    cipherTab: { group: "code", groupName: "Kode & Kripto", toolName: "Ciphers & Analisis" },
    hashTab: { group: "code", groupName: "Kode & Kripto", toolName: "Hash & Basis Angka" },
    barcodeTab: { group: "barcode", groupName: "Barcode & Tools", toolName: "Barcode & QR Code" },
    stylishTab: { group: "barcode", groupName: "Barcode & Tools", toolName: "Stylish Text" },
    devcaseTab: { group: "barcode", groupName: "Barcode & Tools", toolName: "Dev Case & Pidato" }
  };

  function switchTab(targetId) {
    if (!targetId) return;

    // 1. Hide all panels, activate target
    tabPanels.forEach(function(p) { p.classList.remove("active"); });
    var targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }

    // 2. Update dropdown items
    dropdownItems.forEach(function(item) {
      if (item.getAttribute("data-tab") === targetId) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // 3. Update dropdown toggles & active category
    var meta = TOOL_META[targetId];
    if (meta) {
      dropdownToggles.forEach(function(btn) {
        if (btn.getAttribute("data-group") === meta.group) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });

      if (activeToolBreadcrumb) {
        activeToolBreadcrumb.innerText = meta.groupName + " › " + meta.toolName;
      }
    }

    // 4. Sync segment pills & update sliding magnetic glider
    var activePill = null;
    document.querySelectorAll(".segment-pill").forEach(function(pill) {
      if (pill.getAttribute("data-tab") === targetId) {
        pill.classList.add("active");
        activePill = pill;
        try {
          pill.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        } catch (e) {}
      } else {
        pill.classList.remove("active");
      }
    });

    var glider = document.getElementById("navGlider");
    var rail = document.getElementById("workstationRail");
    if (glider && activePill && rail) {
      var railRect = rail.getBoundingClientRect();
      var pillRect = activePill.getBoundingClientRect();
      var leftOffset = pillRect.left - railRect.left + rail.scrollLeft;
      glider.style.width = pillRect.width + "px";
      glider.style.transform = "translateX(" + leftOffset + "px)";
      glider.style.opacity = "1";
    }

    // 5. Sync mobile dock items
    document.querySelectorAll(".dock-item").forEach(function(dock) {
      if (dock.getAttribute("data-tab") === targetId) {
        dock.classList.add("active");
      } else if (dock.hasAttribute("data-tab")) {
        dock.classList.remove("active");
      }
    });

    // 6. Sync mobile tool selector
    if (mobileSelectTool && mobileSelectTool.value !== targetId) {
      mobileSelectTool.value = targetId;
    }

    // 7. Trigger barcode render or morse update if opened
    if (targetId === "barcodeTab") {
      renderBarcodeOrQR();
    } else if (targetId === "morseTab") {
      if (typeof updateMorseTranslation === "function") {
        updateMorseTranslation();
      }
    } else if (targetId === "cipherTab") {
      if (typeof updateRotaryWheelRotation === "function") {
        updateRotaryWheelRotation();
      }
    }

    // Close any open dropdown menus
    navDropdowns.forEach(function(d) { d.classList.remove("open"); });
  }

  // Segment pills click
  document.querySelectorAll(".segment-pill").forEach(function(pill) {
    pill.addEventListener("click", function(e) {
      e.preventDefault();
      var targetId = pill.getAttribute("data-tab");
      switchTab(targetId);
    });
  });

  // Dropdown toggles click
  dropdownToggles.forEach(function(toggle) {
    toggle.addEventListener("click", function(e) {
      e.stopPropagation();
      var parent = toggle.closest(".nav-dropdown");
      var isOpen = parent.classList.contains("open");
      navDropdowns.forEach(function(d) { d.classList.remove("open"); });
      if (!isOpen) {
        parent.classList.add("open");
      }
    });
  });

  // Dropdown items click
  dropdownItems.forEach(function(item) {
    item.addEventListener("click", function(e) {
      e.stopPropagation();
      var targetId = item.getAttribute("data-tab");
      switchTab(targetId);
    });
  });

  // Mobile Bottom Dock items click
  document.querySelectorAll(".dock-item").forEach(function(dock) {
    dock.addEventListener("click", function(e) {
      e.preventDefault();
      var targetId = dock.getAttribute("data-tab");
      if (targetId) {
        switchTab(targetId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (dock.id === "dockMenuBtn") {
        if (typeof openCommandPalette === "function") {
          openCommandPalette();
        }
      }
    });
  });

  // Mobile select change
  if (mobileSelectTool) {
    mobileSelectTool.addEventListener("change", function(e) {
      switchTab(e.target.value);
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", function(e) {
    if (!e.target.closest(".nav-dropdown")) {
      navDropdowns.forEach(function(d) { d.classList.remove("open"); });
    }
  });

  // Footer tab links
  document.querySelectorAll(".footer-mod-link").forEach(function(link) {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      var targetId = link.getAttribute("data-tab-link");
      if (targetId) {
        switchTab(targetId);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // TAB 1: Codec Logic
  var codecInput = document.getElementById("codecInput");
  var codecOutput = document.getElementById("codecOutput");
  var codecSelect = document.getElementById("codecSelect");
  var codecModeBtn = document.getElementById("codecModeBtn");
  var modeIcon = document.getElementById("modeIcon");
  var modeText = document.getElementById("modeText");
  var zalgoOptionGroup = document.getElementById("zalgoOptionGroup");
  var zalgoLevel = document.getElementById("zalgoLevel");
  var codecInputStats = document.getElementById("codecInputStats");
  var codecOutputStats = document.getElementById("codecOutputStats");
  var clearCodecInputBtn = document.getElementById("clearCodecInputBtn");
  var copyCodecOutputBtn = document.getElementById("copyCodecOutputBtn");

  var currentMode = "encode";

  function updateCodecStats() {
    codecInputStats.innerText = codecInput.value.length + " karakter";
    codecOutputStats.innerText = codecOutput.value.length + " karakter";
  }

  var codecMorseBanner = document.getElementById("codecMorseBanner");
  var openMorseStudioFromCodecBtn = document.getElementById("openMorseStudioFromCodecBtn");
  var pasteCodecInputBtn = document.getElementById("pasteCodecInputBtn");
  var swapCodecBtn = document.getElementById("swapCodecBtn");
  var downloadCodecOutputBtn = document.getElementById("downloadCodecOutputBtn");

  function processCodec() {
    var text = codecInput.value;
    var codecKey = codecSelect.value;
    var codec = Codecs[codecKey];

    zalgoOptionGroup.style.display = codecKey === "zalgo" ? "block" : "none";
    if (codecMorseBanner) {
      codecMorseBanner.style.display = codecKey === "morse" ? "flex" : "none";
    }

    if (!text) {
      codecOutput.value = "";
      updateCodecStats();
      return;
    }

    if (!codec) {
      codecOutput.value = text;
      updateCodecStats();
      return;
    }

    try {
      if (codecKey === "zalgo") {
        codecOutput.value = currentMode === "encode"
          ? codec.encode(text, zalgoLevel.value)
          : codec.decode(text);
      } else {
        codecOutput.value = currentMode === "encode"
          ? codec.encode(text)
          : codec.decode(text);
      }
    } catch (e) {
      codecOutput.value = "Error processing text: " + e.message;
    }

    updateCodecStats();
  }

  codecInput.addEventListener("input", processCodec);
  codecSelect.addEventListener("change", processCodec);
  zalgoLevel.addEventListener("change", processCodec);

  if (openMorseStudioFromCodecBtn) {
    openMorseStudioFromCodecBtn.addEventListener("click", function() {
      if (codecInput && morseTextInput && codecInput.value) {
        morseTextInput.value = codecInput.value;
        if (typeof updateMorseTranslation === "function") {
          updateMorseTranslation();
        }
      }
      switchTab("morseTab");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (pasteCodecInputBtn) {
    pasteCodecInputBtn.addEventListener("click", async function() {
      try {
        var text = await navigator.clipboard.readText();
        if (text) {
          codecInput.value = text;
          processCodec();
          showToast("Teks berhasil ditempel!");
        }
      } catch (err) {
        showToast("Izin clipboard diperlukan");
      }
    });
  }

  if (swapCodecBtn) {
    swapCodecBtn.addEventListener("click", function() {
      var prevOut = codecOutput.value;
      if (prevOut && !prevOut.startsWith("Error")) {
        codecInput.value = prevOut;
        codecModeBtn.click();
        showToast("Masukan & hasil berhasil ditukar!");
      } else {
        showToast("Tidak ada hasil yang valid untuk ditukar");
      }
    });
  }

  if (downloadCodecOutputBtn) {
    downloadCodecOutputBtn.addEventListener("click", function() {
      var text = codecOutput.value;
      if (!text || text.startsWith("Error")) {
        showToast("Tidak ada hasil untuk diunduh");
        return;
      }
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "codec-" + (codecSelect ? codecSelect.value : "output") + ".txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Tersimpan sebagai berkas teks");
    });
  }

  codecModeBtn.addEventListener("click", function() {
    currentMode = currentMode === "encode" ? "decode" : "encode";
    if (currentMode === "encode") {
      modeIcon.innerHTML = SVGS.play;
      modeText.innerText = "Mode: Encode";
      codecModeBtn.className = "btn btn-primary";
    } else {
      modeIcon.innerHTML = SVGS.playBack;
      modeText.innerText = "Mode: Decode";
      codecModeBtn.className = "btn btn-gold";
    }

    if (codecOutput.value && !codecOutput.value.startsWith("Error")) {
      codecInput.value = codecOutput.value;
    }
    processCodec();
  });

  clearCodecInputBtn.addEventListener("click", function() {
    codecInput.value = "";
    codecOutput.value = "";
    updateCodecStats();
    codecInput.focus();
  });

  copyCodecOutputBtn.addEventListener("click", function() {
    copyText(codecOutput.value);
  });

  // TAB 2: Cipher & Frequency Logic
  var cipherType = document.getElementById("cipherType") || document.getElementById("cipherSelect");
  var caesarKeyGroup = document.getElementById("caesarKeyGroup");
  var vigenereKeyGroup = document.getElementById("vigenereKeyGroup");
  var caesarShift = document.getElementById("caesarShift");
  var shiftVal = document.getElementById("shiftVal");
  var vigenereKey = document.getElementById("vigenereKey");
  var cipherInput = document.getElementById("cipherInput");
  var cipherResult = document.getElementById("cipherResult");
  var cipherEncryptBtn = document.getElementById("cipherEncryptBtn");
  var cipherDecryptBtn = document.getElementById("cipherDecryptBtn");
  var copyCipherBtn = document.getElementById("copyCipherBtn");
  var freqContainer = document.getElementById("freqContainer");
  var freqTotalStats = document.getElementById("freqTotalStats");

  if (cipherType) {
    cipherType.addEventListener("change", function() {
      if (cipherType.value === "caesar") {
        if (caesarKeyGroup) caesarKeyGroup.style.display = "block";
        if (vigenereKeyGroup) vigenereKeyGroup.style.display = "none";
      } else {
        if (caesarKeyGroup) caesarKeyGroup.style.display = "none";
        if (vigenereKeyGroup) vigenereKeyGroup.style.display = "block";
      }
      runCipher("encrypt");
    });
  }

  // Rotary Caesar Cipher Wheel Logic
  var cipherWheelSvg = document.getElementById("cipherWheelSvg");
  var rotaryWheelLegend = document.getElementById("rotaryWheelLegend");

  function initRotaryWheel() {
    if (!cipherWheelSvg) return;
    var cx = 110, cy = 110;
    var outerR = 86;
    var innerR = 56;
    var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var step = (Math.PI * 2) / 26;

    var svgContent = `
      <defs>
        <filter id="wheelGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.15"/>
        </filter>
      </defs>
      <!-- Base Outer Rim -->
      <circle cx="${cx}" cy="${cy}" r="102" fill="var(--color-surface)" stroke="var(--color-line-2)" stroke-width="2" filter="url(#wheelGlow)"/>
      <circle cx="${cx}" cy="${cy}" r="${outerR + 10}" fill="none" stroke="var(--color-line)" stroke-width="1" stroke-dasharray="3 3"/>
    `;

    // Outer letters (A-Z)
    for (var i = 0; i < 26; i++) {
      var angle = i * step - Math.PI / 2;
      var lx = cx + Math.cos(angle) * outerR;
      var ly = cy + Math.sin(angle) * outerR + 4;
      svgContent += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" font-family="var(--font-mono)" font-weight="700" font-size="11" fill="var(--color-ink)" text-anchor="middle">${alphabet[i]}</text>`;
    }

    // Inner rotating group
    svgContent += `
      <g id="cipherWheelInnerGroup" style="transform-origin: ${cx}px ${cy}px; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);">
        <circle cx="${cx}" cy="${cy}" r="${innerR + 14}" fill="var(--color-surface-2)" stroke="var(--color-accent)" stroke-width="1.8"/>
        <circle cx="${cx}" cy="${cy}" r="${innerR - 16}" fill="var(--color-surface)" stroke="var(--color-line)" stroke-width="1"/>
        <circle cx="${cx}" cy="${cy}" r="4" fill="var(--color-accent)"/>
    `;

    // Inner letters (A-Z)
    for (var j = 0; j < 26; j++) {
      var iangle = j * step - Math.PI / 2;
      var ilx = cx + Math.cos(iangle) * innerR;
      var ily = cy + Math.sin(iangle) * innerR + 3.5;
      svgContent += `<text x="${ilx.toFixed(1)}" y="${ily.toFixed(1)}" font-family="var(--font-mono)" font-weight="700" font-size="9" fill="var(--color-accent-ink)" text-anchor="middle">${alphabet[j]}</text>`;
    }

    svgContent += `</g>`;
    cipherWheelSvg.innerHTML = svgContent;
    updateRotaryWheelRotation();
  }

  function updateRotaryWheelRotation() {
    var innerGroup = document.getElementById("cipherWheelInnerGroup");
    var shift = caesarShift ? parseInt(caesarShift.value, 10) : 3;
    var deg = -(shift * (360 / 26));
    if (innerGroup) {
      innerGroup.style.transform = `rotate(${deg}deg)`;
    }
    if (rotaryWheelLegend) {
      var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      var targetChar = alphabet[shift % 26];
      rotaryWheelLegend.innerText = `Pergeseran Caesar: +${shift} (A → ${targetChar})`;
    }
  }

  initRotaryWheel();

  if (caesarShift) {
    caesarShift.addEventListener("input", function() {
      if (shiftVal) shiftVal.innerText = caesarShift.value;
      updateRotaryWheelRotation();
      runCipher("encrypt");
    });
  }

  if (vigenereKey) {
    vigenereKey.addEventListener("input", function() { runCipher("encrypt"); });
  }
  if (cipherInput) {
    cipherInput.addEventListener("input", function() {
      runCipher("encrypt");
      updateFrequency();
    });
  }

  if (cipherEncryptBtn) cipherEncryptBtn.addEventListener("click", function() { runCipher("encrypt"); });
  if (cipherDecryptBtn) cipherDecryptBtn.addEventListener("click", function() { runCipher("decrypt"); });
  if (copyCipherBtn) copyCipherBtn.addEventListener("click", function() { if (cipherResult) copyText(cipherResult.value); });

  function runCipher(action) {
    var text = cipherInput.value;
    if (!text) {
      cipherResult.value = "";
      return;
    }

    if (cipherType.value === "caesar") {
      var shift = parseInt(caesarShift.value, 10);
      cipherResult.value = action === "encrypt"
        ? Ciphers.caesar.encode(text, shift)
        : Ciphers.caesar.decode(text, shift);
    } else {
      var key = vigenereKey.value || "IRSYADS";
      cipherResult.value = action === "encrypt"
        ? Ciphers.vigenere.encode(text, key)
        : Ciphers.vigenere.decode(text, key);
    }
  }

  function updateFrequency() {
    var data = Ciphers.frequency.analyze(cipherInput.value);
    var counts = data.counts;
    var totalLetters = data.totalLetters;
    freqTotalStats.innerText = totalLetters + " huruf dianalisis";

    freqContainer.innerHTML = "";
    var countsArr = Object.values(counts);
    var maxVal = Math.max.apply(null, countsArr.concat([1]));

    Object.keys(counts).forEach(function(letter) {
      var count = counts[letter];
      var pct = totalLetters > 0 ? ((count / totalLetters) * 100).toFixed(1) : 0;
      var barHeight = Math.round((count / maxVal) * 100);

      var item = document.createElement("div");
      item.className = "freq-item";
      item.innerHTML = '<span class="freq-letter">' + letter + '</span>' +
        '<span class="freq-count">' + count + ' (' + pct + '%)</span>' +
        '<div class="freq-bar-bg">' +
          '<div class="freq-bar-fill" style="width: ' + barHeight + '%;"></div>' +
        '</div>';
      freqContainer.appendChild(item);
    });
  }
  updateFrequency();

  // TAB 3: Hashes & Base Converter Logic
  var hashInput = document.getElementById("hashInput");
  var hashMd5 = document.getElementById("hashMd5");
  var hashSha1 = document.getElementById("hashSha1");
  var hashSha256 = document.getElementById("hashSha256");
  var hashSha512 = document.getElementById("hashSha512");

  var hashCompareInput = document.getElementById("hashCompareInput");
  var hashMatchResult = document.getElementById("hashMatchResult");
  var hashMatchBadge = document.getElementById("hashMatchBadge");

  function verifyHashMatch() {
    if (!hashCompareInput || !hashMatchResult) return;
    var target = hashCompareInput.value.trim().toLowerCase();
    if (!target) {
      hashMatchResult.style.display = "none";
      if (hashMatchBadge) hashMatchBadge.style.display = "none";
      return;
    }

    var md5Val = (hashMd5 ? hashMd5.value : "").toLowerCase();
    var sha1Val = (hashSha1 ? hashSha1.value : "").toLowerCase();
    var sha256Val = (hashSha256 ? hashSha256.value : "").toLowerCase();
    var sha512Val = (hashSha512 ? hashSha512.value : "").toLowerCase();

    var matchedAlgo = null;
    if (target === md5Val) matchedAlgo = "MD5 (128-bit)";
    else if (target === sha1Val) matchedAlgo = "SHA-1 (160-bit)";
    else if (target === sha256Val) matchedAlgo = "SHA-256 (256-bit)";
    else if (target === sha512Val) matchedAlgo = "SHA-512 (512-bit)";

    hashMatchResult.style.display = "flex";
    if (hashMatchBadge) hashMatchBadge.style.display = "inline-flex";

    if (matchedAlgo) {
      hashMatchResult.style.background = "rgba(34, 197, 94, 0.12)";
      hashMatchResult.style.color = "#15803d";
      hashMatchResult.style.border = "1px solid rgba(34, 197, 94, 0.35)";
      hashMatchResult.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
        <span>INTEGRITAS TERVERIFIKASI: Hash cocok 100% dengan <strong>${matchedAlgo}</strong>. Teks otentik dan utuh.</span>
      `;
      if (hashMatchBadge) {
        hashMatchBadge.innerText = "✓ Valid & Cocok";
        hashMatchBadge.style.background = "#22c55e";
        hashMatchBadge.style.color = "#ffffff";
      }
    } else {
      hashMatchResult.style.background = "rgba(239, 68, 68, 0.1)";
      hashMatchResult.style.color = "#b91c1c";
      hashMatchResult.style.border = "1px solid rgba(239, 68, 68, 0.3)";
      hashMatchResult.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <span>CHECKSUM TIDAK COCOK: Hash pembanding tidak cocok dengan teks masukan saat ini.</span>
      `;
      if (hashMatchBadge) {
        hashMatchBadge.innerText = "✕ Tidak Cocok";
        hashMatchBadge.style.background = "#ef4444";
        hashMatchBadge.style.color = "#ffffff";
      }
    }
  }

  async function updateHashes() {
    var text = hashInput.value;
    if (!text) {
      hashMd5.value = "";
      hashSha1.value = "";
      hashSha256.value = "";
      hashSha512.value = "";
      verifyHashMatch();
      return;
    }
    hashMd5.value = Hashes.md5(text);
    hashSha1.value = await Hashes.sha1(text);
    hashSha256.value = await Hashes.sha256(text);
    hashSha512.value = await Hashes.sha512(text);
    verifyHashMatch();
  }

  hashInput.addEventListener("input", updateHashes);
  if (hashCompareInput) {
    hashCompareInput.addEventListener("input", verifyHashMatch);
  }

  var baseDec = document.getElementById("baseDec");
  var baseHex = document.getElementById("baseHex");
  var baseOct = document.getElementById("baseOct");
  var baseBin = document.getElementById("baseBin");

  function bindBaseInput(inputEl, base) {
    inputEl.addEventListener("input", function() {
      var res = Hashes.convertBase(inputEl.value, base);
      if (res) {
        if (base !== 10) baseDec.value = res.dec;
        if (base !== 16) baseHex.value = res.hex;
        if (base !== 8) baseOct.value = res.oct;
        if (base !== 2) baseBin.value = res.bin;
      } else if (!inputEl.value.trim()) {
        baseDec.value = "";
        baseHex.value = "";
        baseOct.value = "";
        baseBin.value = "";
      }
    });
  }

  bindBaseInput(baseDec, 10);
  bindBaseInput(baseHex, 16);
  bindBaseInput(baseOct, 8);
  bindBaseInput(baseBin, 2);

  // TAB 4: Stylish Text Generator
  var stylishInput = document.getElementById("stylishInput");
  var stylishContainer = document.getElementById("stylishContainer");

  var currentStylishCategory = "all";

  function renderStylishText() {
    var text = stylishInput.value || "Muhammad Irsyad Sirojul Khoeir";
    var styles = Stylish.generateAll(text, currentStylishCategory);
    stylishContainer.innerHTML = "";

    styles.forEach(function(s) {
      var card = document.createElement("div");
      card.className = "stylish-card";

      var header = document.createElement("div");
      header.className = "stylish-header";
      header.innerText = s.title;

      var preview = document.createElement("div");
      preview.className = "stylish-preview";
      preview.innerText = s.text;

      var copyBtn = document.createElement("button");
      copyBtn.className = "btn btn-primary";
      copyBtn.style.alignSelf = "flex-start";
      copyBtn.innerHTML = SVGS.copy + " Copy Style";
      copyBtn.onclick = function() { copyText(s.text); };

      card.appendChild(header);
      card.appendChild(preview);
      card.appendChild(copyBtn);
      stylishContainer.appendChild(card);
    });
  }

  // Category filter chips
  var filterChips = document.querySelectorAll(".stylish-filter-chip");
  filterChips.forEach(function(chip) {
    chip.addEventListener("click", function() {
      filterChips.forEach(function(c) { c.classList.remove("active"); });
      chip.classList.add("active");
      currentStylishCategory = chip.getAttribute("data-category") || "all";
      renderStylishText();
    });
  });

  stylishInput.addEventListener("input", renderStylishText);
  renderStylishText();

  // TAB 5: Barcode & QR Code Logic
  var barcodeInput = document.getElementById("barcodeInput");
  var codeTypeSelect = document.getElementById("codeTypeSelect");
  var codeCanvas = document.getElementById("codeCanvas");
  var codeLabel = document.getElementById("codeLabel");
  var generateCodeBtn = document.getElementById("generateCodeBtn");
  var downloadCodeBtn = document.getElementById("downloadCodeBtn");

  function renderBarcodeOrQR() {
    var text = barcodeInput.value.trim() || "https://irsyads.com";
    var type = codeTypeSelect.value;
    codeLabel.innerText = "Format: " + type.toUpperCase() + " | Data: " + text;

    if (type === "code128") {
      BarcodeGenerator.drawBarcode128(codeCanvas, text);
    } else {
      BarcodeGenerator.drawQRCode(codeCanvas, text);
    }
  }

  generateCodeBtn.addEventListener("click", renderBarcodeOrQR);
  barcodeInput.addEventListener("input", renderBarcodeOrQR);
  codeTypeSelect.addEventListener("change", renderBarcodeOrQR);

  downloadCodeBtn.addEventListener("click", function() {
    try {
      var link = document.createElement("a");
      link.download = "irsyads-code-" + Date.now() + ".png";
      link.href = codeCanvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      showToast("Gagal mendownload gambar");
    }
  });

  // TAB 6: Aksara Sunda Logic
  var sundaDirection = document.getElementById("sundaDirection");
  var sundaSwapBtn = document.getElementById("sundaSwapBtn");
  var sundaInput = document.getElementById("sundaInput");
  var sundaOutput = document.getElementById("sundaOutput");
  var sundaInputLabel = document.getElementById("sundaInputLabel");
  var sundaOutputLabel = document.getElementById("sundaOutputLabel");
  var sundaCharCount = document.getElementById("sundaCharCount");
  var sundaClearBtn = document.getElementById("sundaClearBtn");
  var sundaCopyBtn = document.getElementById("sundaCopyBtn");

  function processSunda() {
    var rawText = sundaInput.value;
    sundaCharCount.innerText = rawText.length + " karakter";

    if (!rawText.trim()) {
      sundaOutput.innerText = "";
      return;
    }

    var direction = sundaDirection.value;
    var result = "";
    if (direction === "latin-to-sunda") {
      result = SundaConverter.latinToSunda(rawText);
    } else {
      result = SundaConverter.sundaToLatin(rawText);
    }
    sundaOutput.innerText = result;
    renderSyllableBreakdown();
  }

  function updateSundaLabels() {
    var direction = sundaDirection.value;
    if (direction === "latin-to-sunda") {
      sundaInputLabel.innerText = "Teks Latin Sunda";
      sundaOutputLabel.innerText = "Hasil Aksara Sunda (ᮃᮊ᮪ᮞᮛ ᮞᮥᮔ᮪ᮓ)";
      sundaInput.classList.remove("sunda-font");
      sundaOutput.classList.add("sunda-font");
      sundaInput.placeholder = "Ketik teks di sini, contoh: Sampurasun, kumaha damang?...";
    } else {
      sundaInputLabel.innerText = "Teks Aksara Sunda (ᮃᮊ᮪ᮞᮛ ᮞᮥᮔ᮪ᮓ)";
      sundaOutputLabel.innerText = "Hasil Latin Sunda";
      sundaInput.classList.add("sunda-font");
      sundaOutput.classList.remove("sunda-font");
      sundaInput.placeholder = "Tempel teks aksara Sunda di sini, contoh: ᮞᮙ᮪ᮕᮥᮛᮞᮥᮔ᮪...";
    }
    var dirCapsule = document.querySelector(".direction-indicator-capsule span");
    if (dirCapsule) {
      dirCapsule.innerText = direction === "latin-to-sunda" ? "Latin ➔ Aksara" : "Aksara ➔ Latin";
    }
  }

  sundaInput.addEventListener("input", processSunda);
  sundaDirection.addEventListener("change", function() {
    updateSundaLabels();
    processSunda();
  });

  sundaSwapBtn.addEventListener("click", function() {
    var current = sundaDirection.value;
    sundaDirection.value = current === "latin-to-sunda" ? "sunda-to-latin" : "latin-to-sunda";
    var prevOutput = sundaOutput.innerText;
    sundaInput.value = prevOutput;
    updateSundaLabels();
    processSunda();
  });

  sundaClearBtn.addEventListener("click", function() {
    sundaInput.value = "";
    sundaOutput.innerText = "";
    sundaCharCount.innerText = "0 karakter";
    sundaInput.focus();
  });

  var sundaPasteBtn = document.getElementById("sundaPasteBtn");
  if (sundaPasteBtn) {
    sundaPasteBtn.addEventListener("click", async function() {
      try {
        var text = await navigator.clipboard.readText();
        if (text) {
          sundaInput.value = text;
          processSunda();
          showToast("Teks berhasil ditempel!");
        }
      } catch (err) {
        showToast("Izin clipboard diperlukan");
      }
    });
  }

  sundaCopyBtn.addEventListener("click", function() {
    var text = sundaOutput.innerText;
    if (text) {
      copyText(text);
    } else {
      showToast("Tidak ada teks untuk disalin");
    }
  });

  // Download .txt button
  var sundaDownloadTxtBtn = document.getElementById("sundaDownloadTxtBtn");
  if (sundaDownloadTxtBtn) {
    sundaDownloadTxtBtn.addEventListener("click", function() {
      var text = sundaOutput.innerText;
      if (!text || !text.trim()) {
        showToast("Tidak ada teks untuk diunduh");
        return;
      }
      var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "aksara-sunda.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Tersimpan sebagai aksara-sunda.txt");
    });
  }

  // TTS Pronounce (Audio Speech)
  var sundaSpeechBtn = document.getElementById("sundaSpeechBtn");
  if (sundaSpeechBtn) {
    sundaSpeechBtn.addEventListener("click", function() {
      var text = "";
      if (sundaDirection.value === "latin-to-sunda") {
        text = sundaInput.value.trim();
      } else {
        text = sundaOutput.innerText.trim();
      }
      if (!text) {
        showToast("Tidak ada teks untuk dilafalkan");
        return;
      }
      if (!("speechSynthesis" in window)) {
        showToast("Peramban Anda belum mendukung Speech Synthesis");
        return;
      }
      window.speechSynthesis.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      utter.lang = "id-ID";
      utter.rate = 0.9;
      window.speechSynthesis.speak(utter);
      showToast("Melafalkan audio...");
    });
  }

  // Syllable Breakdown & Inspector
  var sundaInspectSyllablesBtn = document.getElementById("sundaInspectSyllablesBtn");
  var sundaSyllableBreakdown = document.getElementById("sundaSyllableBreakdown");

  function renderSyllableBreakdown() {
    if (!sundaSyllableBreakdown || sundaSyllableBreakdown.style.display === "none") return;
    var latinText = sundaDirection.value === "latin-to-sunda" ? sundaInput.value.trim() : sundaOutput.innerText.trim();
    if (!latinText) {
      sundaSyllableBreakdown.innerHTML = '<span style="color:var(--color-muted);">Ketik kata Sunda di atas untuk menganalisis suku kata dan rarangkén...</span>';
      return;
    }

    var words = latinText.split(/\s+/);
    var html = `
      <div style="font-weight:700; margin-bottom:0.5rem; color:var(--color-ink); display:flex; justify-content:space-between; align-items:center;">
        <span>Morfologi Suku Kata &amp; Aksara Sunda Baku</span>
        <span class="badge">${words.length} Kata</span>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
    `;

    words.forEach(function(word) {
      if (!word) return;
      var aksaraWord = typeof SundaConverter !== "undefined" ? SundaConverter.latinToSunda(word) : "";
      html += `
        <div style="background:var(--color-surface); padding:0.45rem 0.75rem; border-radius:var(--radius-md); border:1px solid var(--color-line); display:flex; flex-direction:column; gap:0.25rem;">
          <span style="font-family:var(--font-mono); font-size:0.8rem; color:var(--color-muted); font-weight:600;">${escapeHtml(word)}</span>
          <span class="sunda-font" style="font-size:1.2rem; color:var(--color-accent-ink); line-height:1.2;">${escapeHtml(aksaraWord)}</span>
        </div>
      `;
    });

    html += `</div>`;
    sundaSyllableBreakdown.innerHTML = html;
  }

  if (sundaInspectSyllablesBtn && sundaSyllableBreakdown) {
    sundaInspectSyllablesBtn.addEventListener("click", function() {
      var isVisible = sundaSyllableBreakdown.style.display !== "none";
      if (isVisible) {
        sundaSyllableBreakdown.style.display = "none";
        sundaInspectSyllablesBtn.classList.remove("active");
      } else {
        sundaSyllableBreakdown.style.display = "block";
        sundaInspectSyllablesBtn.classList.add("active");
        renderSyllableBreakdown();
      }
    });
  }

  // Virtual Keyboard Widget Toggle & Typing
  var toggleVirtualKbBtn = document.getElementById("toggleVirtualKbBtn");
  var closeVirtualKbBtn = document.getElementById("closeVirtualKbBtn");
  var virtualKeyboard = document.getElementById("virtualKeyboard");

  if (toggleVirtualKbBtn && virtualKeyboard) {
    toggleVirtualKbBtn.addEventListener("click", function() {
      virtualKeyboard.classList.toggle("show");
    });
  }
  if (closeVirtualKbBtn && virtualKeyboard) {
    closeVirtualKbBtn.addEventListener("click", function() {
      virtualKeyboard.classList.remove("show");
    });
  }

  if (virtualKeyboard) {
    var kbKeys = virtualKeyboard.querySelectorAll(".kb-key");
    kbKeys.forEach(function(key) {
      key.addEventListener("click", function(e) {
        e.preventDefault();
        var keyAction = key.getAttribute("data-key");
        var charToInsert = key.getAttribute("data-char");

        var start = sundaInput.selectionStart;
        var end = sundaInput.selectionEnd;
        var val = sundaInput.value;

        if (keyAction === "backspace") {
          if (start === end && start > 0) {
            var delLen = 1;
            // Detect surrogate pairs in Aksara Sunda or Unicode
            if (start >= 2 && val.charCodeAt(start - 1) >= 0xDC00 && val.charCodeAt(start - 1) <= 0xDFFF &&
                val.charCodeAt(start - 2) >= 0xD800 && val.charCodeAt(start - 2) <= 0xDBFF) {
              delLen = 2;
            }
            sundaInput.value = val.substring(0, start - delLen) + val.substring(end);
            sundaInput.selectionStart = sundaInput.selectionEnd = start - delLen;
          } else if (start !== end) {
            sundaInput.value = val.substring(0, start) + val.substring(end);
            sundaInput.selectionStart = sundaInput.selectionEnd = start;
          }
        } else if (keyAction === "space") {
          sundaInput.value = val.substring(0, start) + " " + val.substring(end);
          sundaInput.selectionStart = sundaInput.selectionEnd = start + 1;
        } else if (charToInsert) {
          sundaInput.value = val.substring(0, start) + charToInsert + val.substring(end);
          sundaInput.selectionStart = sundaInput.selectionEnd = start + charToInsert.length;
        }

        sundaInput.focus();
        processSunda();
      });
    });
  }

  // Quick insertion buttons (é, eu, è, |, etc.)
  var pillButtons = document.querySelectorAll(".sunda-pill-btn");
  pillButtons.forEach(function(pill) {
    pill.addEventListener("click", function() {
      var insertStr = pill.getAttribute("data-insert");
      var start = sundaInput.selectionStart;
      var end = sundaInput.selectionEnd;
      var val = sundaInput.value;
      sundaInput.value = val.substring(0, start) + insertStr + val.substring(end);
      sundaInput.selectionStart = sundaInput.selectionEnd = start + insertStr.length;
      sundaInput.focus();
      processSunda();
    });
  });

  // Sample phrases chips
  var phraseChips = document.querySelectorAll(".sunda-phrase-chip");
  phraseChips.forEach(function(chip) {
    chip.addEventListener("click", function() {
      var phrase = chip.getAttribute("data-phrase");
      sundaDirection.value = "latin-to-sunda";
      updateSundaLabels();
      sundaInput.value = phrase;
      processSunda();
    });
  });

  // =========================================================================
  // TAB 2: Kamus Sunda Module (Search, Filter, Cards)
  // =========================================================================
  var kamusSearchInput = document.getElementById("kamusSearchInput");
  var kamusFilterChips = document.getElementById("kamusFilterChips");
  var kamusResultsGrid = document.getElementById("kamusResultsGrid");
  var kamusTotalBadge = document.getElementById("kamusTotalBadge");

  var currentKamusCategory = "all";

  var CATEGORY_LABELS = {
    salam: "Salam & Sapaan",
    ganti: "Kata Ganti",
    angka: "Angka & Bilangan",
    warna: "Warna",
    kegiatan: "Kegiatan & Kerja",
    benda: "Benda & Alam",
    sifat: "Sifat & Keadaan",
    falsafah: "Falsafah Luhur"
  };

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderKamus() {
    if (!window.KamusModule || !kamusResultsGrid) return;

    var query = kamusSearchInput ? kamusSearchInput.value : "";
    var results = window.KamusModule.search(query, currentKamusCategory);

    if (kamusTotalBadge) {
      kamusTotalBadge.innerText = results.length + " Kosakata";
    }

    if (results.length === 0) {
      kamusResultsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem 1rem; color: var(--color-muted);">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 0.75rem; opacity: 0.6;"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <p style="font-weight: 600; font-size: 1rem; color: var(--color-ink); margin-bottom: 0.25rem;">Tidak menemukan kosakata</p>
          <p style="font-size: 0.85rem;">Coba cari dengan kata kunci lain atau pilih filter kategori "Semua".</p>
        </div>
      `;
      return;
    }

    var html = results.map(function(item) {
      var catLabel = CATEGORY_LABELS[item.kategori] || item.kategori;
      var copyData = item.sunda + " (" + item.aksara + ") - " + item.arti;
      return `
        <div class="kamus-card">
          <div class="kamus-card-body">
            <div class="kamus-header">
              <span class="kamus-sunda">${escapeHtml(item.sunda)}</span>
              <span class="kamus-cat-badge">${escapeHtml(catLabel)}</span>
            </div>
            <div class="kamus-aksara sunda-font">${escapeHtml(item.aksara)}</div>
            <div class="kamus-arti">${escapeHtml(item.arti)}</div>
          </div>
          <div class="kamus-actions">
            <button type="button" class="micro-btn use-translator-btn" data-sunda="${escapeHtml(item.sunda)}" title="Kirim kata ini ke Translator Aksara Sunda">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>
              <span>Ke Translator</span>
            </button>
            <button type="button" class="micro-btn copy-kamus-btn" data-copy="${escapeHtml(copyData)}" title="Salin kosakata dan artinya">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>
              <span>Salin</span>
            </button>
          </div>
        </div>
      `;
    }).join("");

    kamusResultsGrid.innerHTML = html;

    // Attach click listeners to cards
    kamusResultsGrid.querySelectorAll(".use-translator-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var sundaWord = btn.getAttribute("data-sunda");
        if (sundaWord) {
          sundaDirection.value = "latin-to-sunda";
          updateSundaLabels();
          sundaInput.value = sundaWord;
          processSunda();
          switchTab("sundaTab");
          window.scrollTo({ top: 0, behavior: "smooth" });
          sundaInput.focus();
        }
      });
    });

    kamusResultsGrid.querySelectorAll(".copy-kamus-btn").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var text = btn.getAttribute("data-copy");
        if (text) {
          copyText(text);
        }
      });
    });
  }

  if (kamusSearchInput) {
    kamusSearchInput.addEventListener("input", renderKamus);
  }

  var KAMUS_CATEGORIES = [
    { id: "all", label: "Semua (90)" },
    { id: "salam", label: "Salam & Sapaan" },
    { id: "ganti", label: "Kata Ganti" },
    { id: "angka", label: "Angka & Bilangan" },
    { id: "warna", label: "Rona & Warna" },
    { id: "kegiatan", label: "Kegiatan & Kerja" },
    { id: "benda", label: "Benda & Alam" },
    { id: "sifat", label: "Sifat & Keadaan" },
    { id: "falsafah", label: "Falsafah Luhur" }
  ];

  function renderKamusChips() {
    if (!kamusFilterChips) return;
    var chipHtml = KAMUS_CATEGORIES.map(function(cat) {
      var isActive = cat.id === currentKamusCategory;
      return '<button type="button" class="kamus-filter-chip ' + (isActive ? 'active' : '') + '" data-cat="' + cat.id + '">' + escapeHtml(cat.label) + '</button>';
    }).join("");
    kamusFilterChips.innerHTML = chipHtml;
    kamusFilterChips.querySelectorAll(".kamus-filter-chip").forEach(function(chip) {
      chip.addEventListener("click", function() {
        currentKamusCategory = chip.getAttribute("data-cat") || "all";
        renderKamusChips();
        renderKamus();
      });
    });
  }
  renderKamusChips();

  // =========================================================================
  // TAB 3: Pedoman Cards Interactive insertion
  // =========================================================================
  document.querySelectorAll(".pedoman-card").forEach(function(card) {
    card.style.cursor = "pointer";
    card.setAttribute("title", "Klik untuk menyalin aksara ini");
    card.addEventListener("click", function() {
      var glyph = card.querySelector(".pedoman-glyph");
      var latin = card.querySelector(".pedoman-latin");
      if (glyph) {
        var cleanGlyph = glyph.innerText.replace("◌", "");
        copyText(cleanGlyph);
        showToast("Aksara " + cleanGlyph + " (" + (latin ? latin.innerText : "") + ") disalin!");
      }
    });
  });

  // TAB 9: Developer Case & Text Statistics Logic
  var devcaseInput = document.getElementById("devcaseInput");
  var devcaseClearBtn = document.getElementById("devcaseClearBtn");
  var statWords = document.getElementById("statWords");
  var statAvgWord = document.getElementById("statAvgWord");
  var statChars = document.getElementById("statChars");
  var statCharsNoSpace = document.getElementById("statCharsNoSpace");
  var statSentences = document.getElementById("statSentences");
  var statParagraphs = document.getElementById("statParagraphs");
  var statSpeakingTime = document.getElementById("statSpeakingTime");
  var statReadingTime = document.getElementById("statReadingTime");

  var caseElements = {
    camelCase: document.getElementById("case-camel"),
    pascalCase: document.getElementById("case-pascal"),
    snakeCase: document.getElementById("case-snake"),
    kebabCase: document.getElementById("case-kebab"),
    constantCase: document.getElementById("case-constant"),
    titleCase: document.getElementById("case-title"),
    sentenceCase: document.getElementById("case-sentence"),
    dotCase: document.getElementById("case-dot"),
    pathCase: document.getElementById("case-path"),
    headerCase: document.getElementById("case-header")
  };

  function processDevCaseAndStats() {
    var text = devcaseInput.value;

    // 1. Text Readability & Public Speaking Stats
    var stats = DevCaseModule.TextStats.analyze(text);
    statWords.innerText = stats.words.toLocaleString();
    statAvgWord.innerText = "Rerata: " + stats.avgWordLength + " huruf/kata";
    statChars.innerText = stats.characters.toLocaleString();
    statCharsNoSpace.innerText = stats.charactersNoSpaces.toLocaleString() + " tanpa spasi";
    statSentences.innerText = stats.sentences.toLocaleString() + " kmt";
    statParagraphs.innerText = stats.paragraphs.toLocaleString() + " paragraf";
    statSpeakingTime.innerText = stats.speakingTimeFormatted;
    statReadingTime.innerText = stats.readingTimeFormatted;

    // 2. Developer Case Conversions
    var cases = DevCaseModule.CaseConverter.getAllCases(text);
    for (var k in cases) {
      if (caseElements[k]) {
        caseElements[k].innerText = cases[k] || "-";
      }
    }
  }

  devcaseInput.addEventListener("input", processDevCaseAndStats);
  devcaseClearBtn.addEventListener("click", function() {
    devcaseInput.value = "";
    processDevCaseAndStats();
    devcaseInput.focus();
  });

  // Handle case copy buttons
  var caseCopyButtons = document.querySelectorAll("[data-copy-target]");
  caseCopyButtons.forEach(function(btn) {
    btn.addEventListener("click", function() {
      var targetId = btn.getAttribute("data-copy-target");
      var targetEl = document.getElementById(targetId);
      if (targetEl && targetEl.innerText && targetEl.innerText !== "-") {
        copyText(targetEl.innerText);
      } else {
        showToast("Tidak ada teks untuk disalin");
      }
    });
  });

  // =========================================================================
  // Fullscreen Speech Teleprompter Mode (Public Speaking C.PS.)
  // =========================================================================
  var fullscreenTeleprompter = document.getElementById("fullscreenTeleprompter");
  var openTeleprompterBtn = document.getElementById("openTeleprompterBtn");
  var closeTeleprompterBtn = document.getElementById("closeTeleprompterBtn");
  var teleprompterPlayBtn = document.getElementById("teleprompterPlayBtn");
  var teleprompterMirrorBtn = document.getElementById("teleprompterMirrorBtn");
  var teleprompterSpeedSlider = document.getElementById("teleprompterSpeedSlider");
  var teleprompterSpeedVal = document.getElementById("teleprompterSpeedVal");
  var teleprompterFontSlider = document.getElementById("teleprompterFontSlider");
  var teleprompterFontVal = document.getElementById("teleprompterFontVal");
  var teleprompterContentBox = document.getElementById("teleprompterContentBox");

  var isTeleprompterScrolling = false;
  var teleprompterScrollSpeed = 3;
  var isTeleprompterMirrored = false;
  var teleprompterAnimId = null;

  function openTeleprompter() {
    if (!fullscreenTeleprompter || !teleprompterContentBox) return;
    var text = (devcaseInput ? devcaseInput.value : "").trim();
    if (!text) {
      showToast("Ketik naskah pidato terlebih dahulu");
      return;
    }
    var formattedHtml = text.split(/\n+/).map(function(para) {
      return `<p style="margin-bottom: 2rem;">${escapeHtml(para)}</p>`;
    }).join("");

    teleprompterContentBox.innerHTML = formattedHtml;
    fullscreenTeleprompter.classList.add("open");
    teleprompterContentBox.scrollTop = 0;
  }

  function closeTeleprompter() {
    if (!fullscreenTeleprompter) return;
    fullscreenTeleprompter.classList.remove("open");
    stopTeleprompterScroll();
  }

  function toggleTeleprompterScroll() {
    if (isTeleprompterScrolling) {
      stopTeleprompterScroll();
    } else {
      startTeleprompterScroll();
    }
  }

  function startTeleprompterScroll() {
    isTeleprompterScrolling = true;
    if (teleprompterPlayBtn) {
      teleprompterPlayBtn.innerHTML = "<span>⏸ Jeda Gulir</span>";
      teleprompterPlayBtn.className = "btn btn-gold";
    }
    function scrollStep() {
      if (!isTeleprompterScrolling || !teleprompterContentBox) return;
      teleprompterContentBox.scrollTop += teleprompterScrollSpeed * 0.45;
      if (teleprompterContentBox.scrollTop + teleprompterContentBox.clientHeight >= teleprompterContentBox.scrollHeight) {
        stopTeleprompterScroll();
        return;
      }
      teleprompterAnimId = requestAnimationFrame(scrollStep);
    }
    teleprompterAnimId = requestAnimationFrame(scrollStep);
  }

  function stopTeleprompterScroll() {
    isTeleprompterScrolling = false;
    if (teleprompterAnimId) cancelAnimationFrame(teleprompterAnimId);
    if (teleprompterPlayBtn) {
      teleprompterPlayBtn.innerHTML = "<span>▶ Mulai Gulir</span>";
      teleprompterPlayBtn.className = "btn btn-primary";
    }
  }

  if (openTeleprompterBtn) openTeleprompterBtn.addEventListener("click", openTeleprompter);
  if (closeTeleprompterBtn) closeTeleprompterBtn.addEventListener("click", closeTeleprompter);
  if (teleprompterPlayBtn) teleprompterPlayBtn.addEventListener("click", toggleTeleprompterScroll);

  if (teleprompterMirrorBtn && teleprompterContentBox) {
    teleprompterMirrorBtn.addEventListener("click", function() {
      isTeleprompterMirrored = !isTeleprompterMirrored;
      teleprompterContentBox.style.transform = isTeleprompterMirrored ? "scaleX(-1)" : "none";
      showToast(isTeleprompterMirrored ? "Mode Cermin (Mirror) Aktif" : "Mode Cermin Normal");
    });
  }

  if (teleprompterSpeedSlider && teleprompterSpeedVal) {
    teleprompterSpeedSlider.addEventListener("input", function() {
      teleprompterScrollSpeed = parseInt(this.value, 10);
      teleprompterSpeedVal.innerText = teleprompterScrollSpeed + "x";
    });
  }

  if (teleprompterFontSlider && teleprompterFontVal && teleprompterContentBox) {
    teleprompterFontSlider.addEventListener("input", function() {
      var sz = parseInt(this.value, 10);
      teleprompterFontVal.innerText = sz + "px";
      teleprompterContentBox.style.fontSize = sz + "px";
    });
  }

  // =========================================================================
  // TAB 4: MORSE CODE STUDIO CONTROLLER (Audio & Flashlight / Strobe)
  // =========================================================================
  var morseTextInput = document.getElementById("morseTextInput");
  var morseCodeOutput = document.getElementById("morseCodeOutput");
  var morseLiveTracker = document.getElementById("morseLiveTracker");
  var morseStatusBadge = document.getElementById("morseStatusBadge");

  var morseWpmSlider = document.getElementById("morseWpmSlider");
  var morseWpmVal = document.getElementById("morseWpmVal");
  var morseFreqSlider = document.getElementById("morseFreqSlider");
  var morseFreqVal = document.getElementById("morseFreqVal");
  var morseVolSlider = document.getElementById("morseVolSlider");
  var morseVolVal = document.getElementById("morseVolVal");

  var toggleScreenFlashBtn = document.getElementById("toggleScreenFlashBtn");
  var toggleCameraTorchBtn = document.getElementById("toggleCameraTorchBtn");
  var torchBtnLabel = document.getElementById("torchBtnLabel");
  var openFullscreenStrobeBtn = document.getElementById("openFullscreenStrobeBtn");
  var morseFullscreenStrobe = document.getElementById("morseFullscreenStrobe");
  var closeStrobeBtn = document.getElementById("closeStrobeBtn");
  var strobeStatusText = document.getElementById("strobeStatusText");

  var morsePlayBtn = document.getElementById("morsePlayBtn");
  var morsePauseBtn = document.getElementById("morsePauseBtn");
  var morseStopBtn = document.getElementById("morseStopBtn");
  var morseSampleSosBtn = document.getElementById("morseSampleSosBtn");
  var morseClearBtn = document.getElementById("morseClearBtn");
  var copyMorseOutputBtn = document.getElementById("copyMorseOutputBtn");

  var morseLantern = document.getElementById("morseLantern");
  var morseBeaconStatus = document.getElementById("morseBeaconStatus");
  var morseBeaconSub = document.getElementById("morseBeaconSub");

  var telegraphKeyBtn = document.getElementById("telegraphKeyBtn");
  var telegraphDecodedOutput = document.getElementById("telegraphDecodedOutput");
  var clearTelegraphBtn = document.getElementById("clearTelegraphBtn");
  var morseAlphabetGrid = document.getElementById("morseAlphabetGrid");

  // CRT Oscilloscope Attachment
  var morseOscilloscope = document.getElementById("morseOscilloscope");
  if (morseOscilloscope && window.MorseStudio) {
    window.MorseStudio.attachOscilloscope(morseOscilloscope);
  }

  // Telemetry Dashboard
  var telDitDah = document.getElementById("telDitDah");
  var telRatio = document.getElementById("telRatio");
  var telDuration = document.getElementById("telDuration");

  function updateMorseTelemetry() {
    if (!window.MorseStudio) return;
    var text = morseTextInput ? morseTextInput.value : "";
    var tel = window.MorseStudio.getTelemetryData(text);
    if (telDitDah) telDitDah.innerText = tel.dits + " / " + tel.dahs;
    if (telRatio) telRatio.innerText = tel.ditRatio + ":1";
    if (telDuration) telDuration.innerText = tel.durationSec + "s";
  }

  // Mechanical Relay Click Toggle
  var toggleMechanicalClickBtn = document.getElementById("toggleMechanicalClickBtn");
  var mechClickLabel = document.getElementById("mechClickLabel");
  if (toggleMechanicalClickBtn) {
    toggleMechanicalClickBtn.addEventListener("click", function() {
      if (!window.MorseStudio) return;
      var active = !window.MorseStudio.mechanicalClickEnabled;
      window.MorseStudio.mechanicalClickEnabled = active;
      toggleMechanicalClickBtn.classList.toggle("active", active);
      if (mechClickLabel) {
        mechClickLabel.innerText = active ? "Suara Relay: ON" : "Suara Relay: OFF";
      }
      showToast(active ? "Suara relay mekanis aktif" : "Suara relay mekanis dinonaktifkan");
    });
  }

  function updateMorseTranslation() {
    if (!window.MorseStudio || !morseTextInput || !morseCodeOutput) return;
    var text = morseTextInput.value;
    var morse = window.MorseStudio.encodeText(text);
    morseCodeOutput.value = morse;
    updateMorseTelemetry();

    // Render interactive live tracker spans
    if (morseLiveTracker) {
      if (!morse) {
        morseLiveTracker.innerHTML = '<span style="color: var(--color-muted); font-size: 0.85rem;">Ketik teks di atas untuk memulai transmisi visual...</span>';
        return;
      }
      var tokens = morse.split(/\s+/);
      var html = tokens.map(function(t, i) {
        var cleanToken = t === "/" ? "␣" : t;
        return '<span class="morse-token" data-token-idx="' + i + '">' + cleanToken + '</span>';
      }).join(" ");
      morseLiveTracker.innerHTML = html;
    }
  }

  if (morseTextInput) {
    morseTextInput.addEventListener("input", updateMorseTranslation);
  }

  // Setup Morse Engine Callbacks
  if (window.MorseStudio) {
    window.MorseStudio.onSignalChange = function(isSignalOn) {
      if (morseLantern) {
        if (isSignalOn) {
          morseLantern.classList.add("signal-active");
          if (morseBeaconStatus) {
            morseBeaconStatus.innerText = "SINYAL: TRANSMISI AKTIF (ON)";
            morseBeaconStatus.style.color = "var(--morse-signal-on)";
          }
        } else {
          morseLantern.classList.remove("signal-active");
          if (morseBeaconStatus) {
            morseBeaconStatus.innerText = "SINYAL: SIAGA (OFF)";
            morseBeaconStatus.style.color = "var(--color-ink)";
          }
        }
      }

      // Sync Fullscreen Strobe
      if (morseFullscreenStrobe && morseFullscreenStrobe.classList.contains("open")) {
        morseFullscreenStrobe.classList.toggle("flash-on", isSignalOn);
        if (strobeStatusText) {
          strobeStatusText.innerText = isSignalOn ? "••• FLASH AKTIF •••" : "SINYAL: SIAGA";
        }
      }
    };

    window.MorseStudio.onProgress = function(tokenIdx, sym, isSignal) {
      if (morseLiveTracker) {
        morseLiveTracker.querySelectorAll(".morse-token").forEach(function(el) {
          el.classList.remove("active");
        });
        var activeEl = morseLiveTracker.querySelector('.morse-token[data-token-idx="' + tokenIdx + '"]');
        if (activeEl) {
          activeEl.classList.add("active");
          try {
            activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
          } catch (e) {}
        }
      }
    };

    window.MorseStudio.onStatusChange = function(status) {
      if (!morseStatusBadge) return;
      if (status === "playing") {
        morseStatusBadge.innerText = "Transmisi Sinyal...";
        morseStatusBadge.className = "badge";
        morseStatusBadge.style.background = "var(--morse-signal-on)";
        morseStatusBadge.style.color = "#14183e";
      } else if (status === "paused") {
        morseStatusBadge.innerText = "Transmisi Dijeda";
        morseStatusBadge.className = "badge";
        morseStatusBadge.style.background = "var(--color-gold)";
      } else {
        morseStatusBadge.innerText = "Studio Siaga";
        morseStatusBadge.className = "badge";
        morseStatusBadge.style.background = "";
        morseStatusBadge.style.color = "";
      }
    };

    window.MorseStudio.onComplete = function() {
      if (morseLiveTracker) {
        morseLiveTracker.querySelectorAll(".morse-token").forEach(function(el) {
          el.classList.remove("active");
        });
      }
      showToast("Transmisi sinyal Morse selesai!");
    };
  }

  // Sliders Binding
  if (morseWpmSlider && morseWpmVal) {
    morseWpmSlider.addEventListener("input", function() {
      var val = parseInt(this.value, 10);
      morseWpmVal.innerText = val + " WPM";
      if (window.MorseStudio) {
        window.MorseStudio.wpm = val;
        updateMorseTelemetry();
      }
    });
  }

  if (morseFreqSlider && morseFreqVal) {
    morseFreqSlider.addEventListener("input", function() {
      var val = parseInt(this.value, 10);
      morseFreqVal.innerText = val + " Hz";
      if (window.MorseStudio) window.MorseStudio.frequency = val;
    });
  }

  if (morseVolSlider && morseVolVal) {
    morseVolSlider.addEventListener("input", function() {
      var val = parseInt(this.value, 10);
      morseVolVal.innerText = val + "%";
      if (window.MorseStudio) window.MorseStudio.volume = val / 100;
    });
  }

  // Toggles
  if (toggleScreenFlashBtn) {
    toggleScreenFlashBtn.addEventListener("click", function() {
      var isActive = toggleScreenFlashBtn.classList.toggle("active");
      toggleScreenFlashBtn.querySelector("span").innerText = isActive ? "Kedip Layar: ON" : "Kedip Layar: OFF";
      if (window.MorseStudio) window.MorseStudio.flashScreenEnabled = isActive;
    });
  }

  if (toggleCameraTorchBtn) {
    toggleCameraTorchBtn.addEventListener("click", async function() {
      if (!window.MorseStudio) return;
      if (!window.MorseStudio.torchCameraEnabled) {
        try {
          await window.MorseStudio.enableTorch();
          toggleCameraTorchBtn.classList.add("active");
          if (torchBtnLabel) torchBtnLabel.innerText = "Flash Senter Ponsel: AKTIF";
          showToast("Flashlight kamera aktif & siap berkedip!");
        } catch (err) {
          toggleCameraTorchBtn.classList.remove("active");
          if (torchBtnLabel) torchBtnLabel.innerText = "Flash Senter Ponsel: OFF";
          showToast(err.message || "Fitur senter kamera tidak didukung.");
        }
      } else {
        await window.MorseStudio.disableTorch();
        toggleCameraTorchBtn.classList.remove("active");
        if (torchBtnLabel) torchBtnLabel.innerText = "Flash Senter Ponsel: OFF";
        showToast("Flashlight kamera dimatikan.");
      }
    });
  }

  // Fullscreen Strobe Overlay
  if (openFullscreenStrobeBtn && morseFullscreenStrobe) {
    openFullscreenStrobeBtn.addEventListener("click", function() {
      morseFullscreenStrobe.classList.add("open");
      if (window.MorseStudio && !window.MorseStudio.isPlaying && morseCodeOutput && morseCodeOutput.value) {
        window.MorseStudio.play(morseCodeOutput.value);
      }
    });
  }
  if (closeStrobeBtn && morseFullscreenStrobe) {
    closeStrobeBtn.addEventListener("click", function() {
      morseFullscreenStrobe.classList.remove("open");
    });
  }

  // Playback Control Buttons
  if (morsePlayBtn) {
    morsePlayBtn.addEventListener("click", function() {
      if (!window.MorseStudio || !morseCodeOutput) return;
      var morse = morseCodeOutput.value.trim();
      if (!morse) {
        showToast("Ketik teks terlebih dahulu untuk diputar");
        return;
      }
      window.MorseStudio.play(morse);
    });
  }

  if (morsePauseBtn) {
    morsePauseBtn.addEventListener("click", function() {
      if (!window.MorseStudio) return;
      if (window.MorseStudio.isPaused) {
        window.MorseStudio.resume();
      } else if (window.MorseStudio.isPlaying) {
        window.MorseStudio.pause();
      }
    });
  }

  if (morseStopBtn) {
    morseStopBtn.addEventListener("click", function() {
      if (window.MorseStudio) window.MorseStudio.stop();
    });
  }

  if (morseSampleSosBtn && morseTextInput) {
    morseSampleSosBtn.addEventListener("click", function() {
      morseTextInput.value = "SOS";
      updateMorseTranslation();
      if (window.MorseStudio) {
        window.MorseStudio.play("... --- ...");
      }
    });
  }

  if (morseClearBtn && morseTextInput) {
    morseClearBtn.addEventListener("click", function() {
      morseTextInput.value = "";
      updateMorseTranslation();
      if (window.MorseStudio) window.MorseStudio.stop();
      morseTextInput.focus();
    });
  }

  if (copyMorseOutputBtn && morseCodeOutput) {
    copyMorseOutputBtn.addEventListener("click", function() {
      copyText(morseCodeOutput.value);
    });
  }

  // Manual Telegraph Keyer
  if (telegraphKeyBtn && window.MorseStudio) {
    var isKeyDown = false;

    function handleKeyDown(e) {
      if (e) e.preventDefault();
      if (isKeyDown) return;
      isKeyDown = true;
      telegraphKeyBtn.classList.add("is-pressed");
      window.MorseStudio.manualKeyDown();
    }

    function handleKeyUp(e) {
      if (e) e.preventDefault();
      if (!isKeyDown) return;
      isKeyDown = false;
      telegraphKeyBtn.classList.remove("is-pressed");
      window.MorseStudio.manualKeyUp(function(letter, rawMorse) {
        if (telegraphDecodedOutput) {
          if (telegraphDecodedOutput.innerText === "-" || !telegraphDecodedOutput.innerText) {
            telegraphDecodedOutput.innerText = "";
          }
          telegraphDecodedOutput.innerText += letter;
        }
      });
    }

    telegraphKeyBtn.addEventListener("mousedown", handleKeyDown);
    telegraphKeyBtn.addEventListener("mouseup", handleKeyUp);
    telegraphKeyBtn.addEventListener("mouseleave", handleKeyUp);

    telegraphKeyBtn.addEventListener("touchstart", handleKeyDown, { passive: false });
    telegraphKeyBtn.addEventListener("touchend", handleKeyUp, { passive: false });
    telegraphKeyBtn.addEventListener("touchcancel", handleKeyUp, { passive: false });

    // Spacebar binding when in Morse tab and not typing in textareas
    document.addEventListener("keydown", function(e) {
      if (e.code === "Space") {
        var activePanel = document.querySelector(".tab-panel.active");
        if (activePanel && activePanel.id === "morseTab") {
          var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
          if (tag !== "input" && tag !== "textarea") {
            e.preventDefault();
            handleKeyDown();
          }
        }
      }
    });

    document.addEventListener("keyup", function(e) {
      if (e.code === "Space") {
        var activePanel = document.querySelector(".tab-panel.active");
        if (activePanel && activePanel.id === "morseTab") {
          var tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
          if (tag !== "input" && tag !== "textarea") {
            e.preventDefault();
            handleKeyUp();
          }
        }
      }
    });
  }

  if (clearTelegraphBtn && telegraphDecodedOutput) {
    clearTelegraphBtn.addEventListener("click", function() {
      telegraphDecodedOutput.innerText = "-";
      showToast("Hasil ketukan dibersihkan");
    });
  }

  // Populate Morse Alphabet Grid
  if (morseAlphabetGrid && window.MORSE_MAP) {
    var alphaHtml = Object.keys(window.MORSE_MAP).map(function(ch) {
      if (ch === " ") return "";
      var code = window.MORSE_MAP[ch];
      return '<div class="morse-alpha-card" data-char="' + ch + '" title="Klik untuk memutar nada ' + ch + '">' +
               '<span class="morse-alpha-char">' + ch + '</span>' +
               '<span class="morse-alpha-code">' + code + '</span>' +
             '</div>';
    }).join("");
    morseAlphabetGrid.innerHTML = alphaHtml;

    morseAlphabetGrid.querySelectorAll(".morse-alpha-card").forEach(function(card) {
      card.addEventListener("click", function() {
        var ch = card.getAttribute("data-char");
        if (ch && window.MorseStudio) {
          window.MorseStudio.playSingleChar(ch);
          card.style.transform = "scale(0.92)";
          setTimeout(function() { card.style.transform = ""; }, 150);
        }
      });
    });
  }

  // Populate Emergency & Radio Q-Codes Soundboard Matrix
  var morseSoundboardMatrix = document.getElementById("morseSoundboardMatrix");
  var SOUNDBOARD_ITEMS = [
    { title: "SOS", code: "... --- ...", desc: "Sinyal Darurat Internasional (Save Our Souls)" },
    { title: "MAYDAY", code: "-- .- -.-- -.. .- -.--", desc: "Sinyal Bahaya Maritim & Aviasi" },
    { title: "CQ", code: "-.-. --.-", desc: "Panggilan Terbuka Radio (Seek You)" },
    { title: "73", code: "--... ...--", desc: "Salam Hangat & Sukses Radio Amatir" },
    { title: "88", code: "---.. ---..", desc: "Salam Kasih Sayang (Love and Kisses)" },
    { title: "TEST", code: "- . ... -", desc: "Uji Coba Transmisi Frekuensi" },
    { title: "OK", code: "--- -.-", desc: "Konfirmasi Diterima (All Correct)" },
    { title: "HI", code: ".... ..", desc: "Salam Senyum Ramah Radio" }
  ];

  if (morseSoundboardMatrix) {
    morseSoundboardMatrix.innerHTML = SOUNDBOARD_ITEMS.map(function(item) {
      return `
        <div class="soundboard-card" data-code="${item.code}" data-title="${item.title}" title="${item.desc}">
          <span class="soundboard-char">${item.title}</span>
          <span class="soundboard-morse">${item.code}</span>
        </div>
      `;
    }).join("");

    morseSoundboardMatrix.querySelectorAll(".soundboard-card").forEach(function(card) {
      card.addEventListener("click", function() {
        var code = card.getAttribute("data-code");
        var title = card.getAttribute("data-title");
        if (morseTextInput) morseTextInput.value = title;
        updateMorseTranslation();
        if (window.MorseStudio) {
          window.MorseStudio.play(code);
        }
      });
    });
  }

  // =========================================================================
  // COMMAND PALETTE (Ctrl+K / ⌘K) CONTROLLER
  // =========================================================================
  var commandPaletteModal = document.getElementById("commandPaletteModal");
  var openCommandPaletteBtn = document.getElementById("openCommandPaletteBtn");
  var cpSearchInput = document.getElementById("cpSearchInput");
  var cpResultsList = document.getElementById("cpResultsList");

  var COMMAND_ITEMS = [
    { title: "Pangalihtulis Aksara Sunda", category: "Aksara Sunda", desc: "Transliterasi dua arah Latin ↔ Aksara Sunda baku", tab: "sundaTab", icon: "ᮃ" },
    { title: "Kamus Basa Sunda", category: "Aksara Sunda", desc: "Kamus 90 kosakata Sunda, arti Indonesia & Aksara", tab: "kamusTab", icon: "📖" },
    { title: "Pedoman & Tabel Aksara", category: "Aksara Sunda", desc: "Tabel Swara, Ngalagena, Rarangkén, Angka", tab: "pedomanTab", icon: "📊" },
    { title: "Morse Studio & Flashlight", category: "Kode & Kripto", desc: "Audio Beeps, Kedip Layar & Flash Kamera Senter", tab: "morseTab", icon: "📡" },
    { title: "Codec & Encoders", category: "Kode & Kripto", desc: "Biner, Hex, Base64, URL, Unicode, Zalgo", tab: "codecTab", icon: "⚡" },
    { title: "Ciphers & Analisis Frekuensi", category: "Kode & Kripto", desc: "Caesar, Vigenère & Analisis Frekuensi Huruf", tab: "cipherTab", icon: "🔒" },
    { title: "Hash & Basis Angka", category: "Kode & Kripto", desc: "MD5, SHA-1, SHA-256 & Konversi Bilangan", tab: "hashTab", icon: "#" },
    { title: "Barcode & QR Code", category: "Barcode & Tools", desc: "Generator QR Code & Barcode 128 (PNG)", tab: "barcodeTab", icon: "📷" },
    { title: "Stylish Text Generator", category: "Barcode & Tools", desc: "20+ Gaya tipografi estetik Unicode", tab: "stylishTab", icon: "✨" },
    { title: "Dev Case & Metrik Pidato", category: "Barcode & Tools", desc: "10 Naming Cases & Metrik Durasi Pidato (C.PS.)", tab: "devcaseTab", icon: "🎙️" },
    { title: "Mode Teleprompter Pidato", category: "Barcode & Tools", desc: "Layar penuh teleprompter naskah dengan autoscroll & mirror", action: "teleprompter", icon: "📺" },
    { title: "Mode Gelap (Dark Mode)", category: "Tampilan & Tema", desc: "Ganti tampilan menjadi tema malam / gelap", action: "theme-dark", icon: "🌙" },
    { title: "Mode Terang (Light Mode)", category: "Tampilan & Tema", desc: "Ganti tampilan menjadi tema terang", action: "theme-light", icon: "☀️" },
    { title: "Palet: Krem Signature", category: "Palet Warna", desc: "Warna bawaan elegan irsyads.com", action: "palette-krem", icon: "🎨" },
    { title: "Palet: Hutan (Forest)", category: "Palet Warna", desc: "Nuansa hijau alami", action: "palette-forest", icon: "🌲" },
    { title: "Palet: Samudra (Ocean)", category: "Palet Warna", desc: "Nuansa biru samudra", action: "palette-ocean", icon: "🌊" },
    { title: "Palet: Senja (Royal)", category: "Palet Warna", desc: "Nuansa ungu senja", action: "palette-royal", icon: "🔮" },
    { title: "Palet: Aurora (Tosca)", category: "Palet Warna", desc: "Nuansa tosca aurora", action: "palette-aurora", icon: "✨" },
    { title: "Palet: Tanah (Earth)", category: "Palet Warna", desc: "Nuansa terakota hangat", action: "palette-earth", icon: "🏺" }
  ];

  var selectedCpIndex = 0;
  var currentFilteredItems = [];

  function openCommandPalette() {
    if (!commandPaletteModal) return;
    commandPaletteModal.classList.add("open");
    if (cpSearchInput) {
      cpSearchInput.value = "";
      cpSearchInput.focus();
    }
    renderCommandPalette();
  }

  function closeCommandPalette() {
    if (!commandPaletteModal) return;
    commandPaletteModal.classList.remove("open");
  }

  function renderCommandPalette() {
    if (!cpResultsList) return;
    var query = cpSearchInput ? cpSearchInput.value.toLowerCase().trim() : "";

    currentFilteredItems = COMMAND_ITEMS.filter(function(item) {
      if (!query) return true;
      return item.title.toLowerCase().indexOf(query) !== -1 ||
             item.category.toLowerCase().indexOf(query) !== -1 ||
             item.desc.toLowerCase().indexOf(query) !== -1;
    });

    if (selectedCpIndex >= currentFilteredItems.length) {
      selectedCpIndex = 0;
    }

    if (currentFilteredItems.length === 0) {
      cpResultsList.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--color-muted); font-size: 0.88rem;">Tidak ada perintah atau perkakas yang cocok</div>';
      return;
    }

    var html = "";
    var lastCategory = "";

    currentFilteredItems.forEach(function(item, idx) {
      if (item.category !== lastCategory) {
        html += '<div class="cp-group-header">' + escapeHtml(item.category) + '</div>';
        lastCategory = item.category;
      }
      var isSelected = idx === selectedCpIndex;
      html += `
        <div class="cp-item ${isSelected ? 'selected' : ''}" data-item-idx="${idx}">
          <div class="cp-item-left">
            <div class="cp-item-icon">${item.icon}</div>
            <div>
              <span class="cp-item-title">${escapeHtml(item.title)}</span>
              <span class="cp-item-desc">${escapeHtml(item.desc)}</span>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      `;
    });

    cpResultsList.innerHTML = html;

    cpResultsList.querySelectorAll(".cp-item").forEach(function(el) {
      el.addEventListener("click", function() {
        var idx = parseInt(el.getAttribute("data-item-idx"), 10);
        executeCommandItem(currentFilteredItems[idx]);
      });
    });
  }

  function executeCommandItem(item) {
    if (!item) return;
    closeCommandPalette();
    if (item.tab) {
      switchTab(item.tab);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (item.action) {
      if (item.action === "theme-dark") {
        html.setAttribute("data-theme", "dark");
        localStorage.setItem("irsyads_theme", "dark");
        updateThemeButton("dark");
      } else if (item.action === "theme-light") {
        html.setAttribute("data-theme", "light");
        localStorage.setItem("irsyads_theme", "light");
        updateThemeButton("light");
      } else if (item.action.startsWith("palette-")) {
        var pal = item.action.replace("palette-", "");
        setPalette(pal);
      } else if (item.action === "teleprompter") {
        switchTab("devcaseTab");
        if (typeof openTeleprompter === "function") {
          openTeleprompter();
        }
      }
    }
  }

  if (openCommandPaletteBtn) {
    openCommandPaletteBtn.addEventListener("click", openCommandPalette);
  }

  if (cpSearchInput) {
    cpSearchInput.addEventListener("input", function() {
      selectedCpIndex = 0;
      renderCommandPalette();
    });

    cpSearchInput.addEventListener("keydown", function(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedCpIndex = (selectedCpIndex + 1) % currentFilteredItems.length;
        renderCommandPalette();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedCpIndex = (selectedCpIndex - 1 + currentFilteredItems.length) % currentFilteredItems.length;
        renderCommandPalette();
      } else if (e.key === "Enter") {
        e.preventDefault();
        executeCommandItem(currentFilteredItems[selectedCpIndex]);
      } else if (e.key === "Escape") {
        closeCommandPalette();
      }
    });
  }

  // Global Ctrl+K / Cmd+K listener
  document.addEventListener("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (commandPaletteModal && commandPaletteModal.classList.contains("open")) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    } else if (e.key === "Escape") {
      closeCommandPalette();
      if (morseFullscreenStrobe) morseFullscreenStrobe.classList.remove("open");
      if (typeof closeTeleprompter === "function") closeTeleprompter();
    }
  });

  if (commandPaletteModal) {
    commandPaletteModal.addEventListener("click", function(e) {
      if (e.target === commandPaletteModal) {
        closeCommandPalette();
      }
    });
  }

  // Initialize initial sample values safely
  if (codecInput) {
    codecInput.value = "Muhammad Irsyad Sirojul Khoeir - irsyads.com";
    processCodec();
  }
  if (sundaInput) {
    sundaInput.value = "Sampurasun! Wilujeng sumping di Jawa Barat.";
    processSunda();
  }
  if (morseTextInput) {
    updateMorseTranslation();
  }
  renderKamus();
  if (devcaseInput) {
    processDevCaseAndStats();
  }
  renderBarcodeOrQR();

  // Initial Glider Alignment
  function alignNavGlider() {
    var activePill = document.querySelector(".segment-pill.active");
    var glider = document.getElementById("navGlider");
    var rail = document.getElementById("workstationRail");
    if (glider && activePill && rail) {
      var railRect = rail.getBoundingClientRect();
      var pillRect = activePill.getBoundingClientRect();
      var leftOffset = pillRect.left - railRect.left + rail.scrollLeft;
      glider.style.width = pillRect.width + "px";
      glider.style.transform = "translateX(" + leftOffset + "px)";
      glider.style.opacity = "1";
    }
  }
  setTimeout(alignNavGlider, 100);
  window.addEventListener("resize", alignNavGlider);

  // Interactive Pedoman Cards (Click to Copy / Test)
  document.querySelectorAll(".pedoman-card").forEach(function(card) {
    card.addEventListener("click", function() {
      var glyph = card.querySelector(".pedoman-glyph");
      var latin = card.querySelector(".pedoman-latin");
      if (glyph) {
        var char = glyph.innerText.replace("◌", "").trim();
        copyText(char);
        showToast("Karakter " + char + " (" + (latin ? latin.innerText : "") + ") tersalin!");
        if (sundaInput) {
          var start = sundaInput.selectionStart;
          var end = sundaInput.selectionEnd;
          var val = sundaInput.value;
          sundaInput.value = val.substring(0, start) + char + val.substring(end);
          sundaInput.selectionStart = sundaInput.selectionEnd = start + char.length;
          processSunda();
        }
      }
    });
  });
});


