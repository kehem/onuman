# Onuman – Documentation

**Software Name:** Onuman  
**Version:** 1.0.0 (Beta)  
**Developer:** KEHEM IT  
**Associate Partner:** [Openhouse Group](https://openhousegroupbd.com/)  
**Currently Available For:** Windows (.exe), Linux (.deb)  

---

## 📌 Overview
**Onuman** is a next-generation estimation software designed for civil engineers, architects, and construction professionals.  
It simplifies project cost management, structural analysis, and reporting with an intuitive interface and powerful automation features.  

With Onuman, you can manage **new construction projects, material costs, advanced reporting, project analysis, and team collaboration** all within a single platform.  

---

## 📌 System Requirements

### Windows
- **Minimum:** Windows 10 (64-bit), Dual-core 2.0 GHz (Intel i3/AMD equivalent), 2 GB RAM, 500 MB free disk space, 1366×768 display.  
- **Recommended:** Windows 11 (64-bit), Quad-core 2.5 GHz+ (Intel i5/Ryzen 5), 4 GB RAM, 1 GB free disk space, 1920×1080 display.  

### Linux
- **Minimum:** Ubuntu 20.04+ / Fedora 36+ / Debian 11+, Dual-core 2.0 GHz (Intel i3/AMD equivalent), 2 GB RAM, 500 MB free disk space, 1366×768 display.  
- **Recommended:** Ubuntu 22.04+ / Fedora 38+ / Debian 12+, Quad-core 2.5 GHz+, 4 GB RAM, 1 GB free disk space, 1920×1080 display.  

### macOS
- **Minimum:** macOS 11 (Big Sur), Intel i3 dual-core or Apple M1, 2 GB RAM, 500 MB free disk space, 1366×768 display.  
- **Recommended:** macOS 13 (Ventura) or later, Intel i5 quad-core or Apple M1/M2, 4 GB RAM, 1 GB free disk space, 1920×1080 display.  

---

## 📌 Purpose
Onuman is developed to provide:  
1. Simple civil and architectural estimation solutions.  
2. Complete coverage for **Exterior, Finishing, and Interior** works.  

---

## 📌 Key Features
1. **Project Management** – Create new projects for construction works.  
2. **Material Cost Management** – Add, update, or remove materials with a built-in dataset.  
3. **Advanced Report Generation** – Export reports in **PDF, CSV, DOC** or preview live.  
4. **Project Analyzer** – Perform deep project analysis.  
5. **Realtime Team Chat** – Private messaging for employees using Onuman.  
6. **Local FTP Server** – Share project files securely within the team.  
7. **Tab Management** – Work on multiple projects simultaneously.  
8. **Project Dashboard** – Get an overview of each project at a glance.  
9. **Search Functionalities** – Quickly locate project elements.  
10. **Keyboard Shortcuts** – Fast navigation and operations.  
11. **Bottom Utility Bar** – Reload server, switch units (ft, in, yd, mm, cm), and view notifications.  

---

## 📌 Project Features
1. Dual-pane interface: **Input Window** and **Output Window**.  
2. **Presets** – Save and reuse input templates.  
3. **Smart Unit Input** – Enter values like `4ft`, `10ft 5.3in` → automatically converted to **mm (base unit)** with both values displayed.  
4. **Support Images** – Attach images to each project item.  
5. **Output Table View** – Simple, structured presentation of results.  
6. **Reinforcement & Stirrup Details** – Includes CC (Cement Concrete) calculations where necessary.  
7. **Floor-by-Floor Breakdown** – Inspect project details per floor (e.g., short/long columns).  
8. **Navigation** – Seamlessly switch between Exterior, Finishing, and Interior works.  
9. **2D Views (Coming Soon)** – Generate 2D visualizations (e.g., Pile layout).  
10. **User-Friendly Interface** – Clean, intuitive, and easy to use.  
11. **Comment System** – Add comments for each row in the output table.  
12. **Item Management** – Edit or delete project elements (Pile, Tiles, etc.).  
13. **Resizable Layout** – Adjust Input and Output panels with drag-and-drop.  

---

## 📌 Currently Supported Workflows

**Exteriors**  
- Pile  
- Share Wall  
- Footing  
- Column  
- Sand Filling  
- Beam  
- Slab  
- Brick  

**Finishing**  
- Plaster  
- Paint  
- Window  
- Grill  
- Glass  
- Water Reservoir  
- Tiles  
- Electric  
- Plumbing  

**Interior**  
- Coming Soon...  

---

## 📌 Future Enhancements
Onuman is continuously evolving. In the near future, the following features will be added:  

1. **AI-Powered Advanced Analytics** – Automatically analyze projects, detect optimization opportunities, and provide smart recommendations for cost reduction, structural efficiency, and workflow improvements.  
2. **AI-Based Auto Project Suggestion** – Suggest project presets and configurations based on past projects and industry standards. This will save time and guide new users effectively.  
3. **3D Model Visualization** – Generate interactive 3D models of construction elements (piles, beams, slabs, etc.) for better visualization and understanding of project structures.  
4. **Enhanced Collaboration** – Cloud-based project sync with version control and shared dashboards.  
5. **Extended Interior Modules** – Full support for interior design elements including furniture, room layouts, and decoration materials.  

---

## 🛠️ Developer Tools (Debugging)

DevTools are **always available in development** and **opt-in in packaged builds** (a build only enables them when it was made with `ENABLE_DEVTOOLS=true`).

### Open DevTools in the app

| Action | Shortcut |
| --- | --- |
| Toggle DevTools (detached window) | `F12` |
| Toggle DevTools | `Ctrl + Shift + I` (`Cmd + Shift + I` on macOS) |
| Toggle console | `Ctrl + Shift + J` (`Cmd + Shift + J` on macOS) |
| Inspect element | Right-click → **Inspect Element** |

Shortcuts are handled in the main process (`before-input-event`), because the window is frameless with `autoHideMenuBar`, so the default Electron menu accelerators never reach the user.

### From code / the renderer

```ts
// main process
win.webContents.openDevTools({ mode: 'detach' }) // 'right' | 'bottom' | 'undocked'

// renderer (exposed by the preload bridge)
await window.electronAPI.toggleDevTools()
await window.electronAPI.isDevToolsEnabled()
await window.electronAPI.copyConsoleLogs()   // console buffer → clipboard
await window.electronAPI.exportConsoleLogs() // console buffer → .log file
```

Helpers live in `src/main/devtools.ts` (`openDevTools`, `toggleDevTools`, `closeDevTools`, `isDevToolsOpen`) and the matching IPC handlers in `src/main/ipc/devtools.ts`.

### Builds and scripts

```bash
npm run dev            # electron-vite dev, DevTools enabled
npm run dev:inspect    # dev + main-process inspector on 127.0.0.1:9229 (chrome://inspect)
npm run dev:remote     # dev + remote debugging port 9222
npm run build:win-dev  # packaged Windows build with ENABLE_DEVTOOLS=true
npm run build:mac-dev  # packaged macOS build with ENABLE_DEVTOOLS=true
npm run build:linux-dev# packaged Linux build with ENABLE_DEVTOOLS=true
```

Environment variables:

- `ENABLE_DEVTOOLS=true` – allow DevTools in a packaged build.
- `DEVTOOLS_MODE=detach|right|bottom|undocked` – where the panel docks (default `detach`, which is the only mode that behaves well with a frameless window).

### Inspecting the main / preload processes

Run `npm run dev:inspect`, open `chrome://inspect` in Chrome/Edge, and pick the 9229 target. Main-process `console.log` output also appears in the terminal that started the app.

### When DevTools are disabled

Pressing `F12` shows a hint dialog instead. The renderer console buffer can still be copied or exported to a `.log` file with `window.electronAPI.exportConsoleLogs()`, which is the recommended way to collect logs from a customer machine.

---

## ✅ Conclusion
Onuman provides a **modern, AI-ready, user-friendly** solution for civil and architectural estimation.  
It bridges the gap between project planning, cost analysis, team collaboration, and future-ready automation with AI and 3D modeling.  

This is only the beginning – with version **1.0.0 (Beta)**, Onuman lays the foundation for the next generation of construction estimation software.  
