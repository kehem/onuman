# 🧱 Long Reinforcement Input Template (`<template>`)

This component provides an interactive UI for entering **reinforcement details** for slabs, including **main reinforcements**, **crank bars**, and **top bars**. It supports both **area mode** and **manual mode**, offers dynamic form fields, and includes unit conversion, tooltips, and support toggles.

---

## 📦 Features

- ✅ Dynamic form fields for each reinforcement
- 📏 Supports unit conversion (with original values)
- 🧮 Auto-handles slab width/length when available
- 🛠 Crank bar and Top bar sections (toggleable)
- 🧑‍🏫 Tooltip help messages for better UX
- 🔄 Add/Remove reinforcements interactively

---

## 🧩 Props

| Prop              | Type    | Description                                           |
| ----------------- | ------- | ----------------------------------------------------- |
| `reinforcements`  | Array   | List of reinforcement objects                         |
| `slabWidth`       | Number  | Slab width (used in manual mode)                      |
| `slabLength`      | Number  | Slab length (used in manual mode)                     |
| `inputMode`       | String  | Input mode: `'manual'` or `'area'`                    |
| `isArea`          | Boolean | Whether area mode is enabled                          |
| `crankBar`        | Boolean | Whether crank bar input section is visible            |
| `crankBarData`    | Array   | List of crank bar reinforcement objects               |
| `crankBarSupport` | Boolean | Whether crank bars are supported                      |
| `topBar`          | Boolean | Whether top bar input section is visible              |
| `topBarData`      | Array   | List of top bar reinforcement objects                 |
| `topBarSupport`   | Boolean | Whether top bars are supported                        |
| `diameterOptions` | Array   | Array of diameter options (each with `{ bar, suta }`) |

---

## 📤 Emits

| Event                  | Payload         | Description                      |
| ---------------------- | --------------- | -------------------------------- |
| `add-reinforcement`    | —               | Adds a new reinforcement         |
| `remove-reinforcement` | `index: number` | Removes a reinforcement by index |

---

## 🧱 Sections Overview

### 🔹 1. Long Reinforcements

- Displays input for:
  - Width (manual or auto from SlabBasic)
  - Horizontal diameter & distance
  - Vertical length, diameter & distance
- Includes:
  - Support checkbox
  - Add / Remove buttons (only for last item)

### 🔹 2. Crank Bar

- Enabled by checkbox toggle: `Is Crank Bar?`
- Width and distance calculated automatically
- Read-only values
- Individual crank bar item support toggle

### 🔹 3. Top Bar

- Enabled by checkbox toggle: `Is Top Bar?`
- Length and distance calculated automatically
- Read-only values
- Individual top bar item support toggle

---

## 🧩 Components Used

- `Tooltip`: For contextual hints and guidance
- `UnitConverterInput`: Custom component to convert between measurement units
- `SlabBasic`: For selecting slab type, floor levels, and input mode (area/manual)

---

## 🛠 Dynamic ID & Value Binding

All fields are dynamically assigned IDs like:

- `rodwidth-0`, `reinforcement-horizontal-1`, `top-rodlength-2`, etc.

This ensures proper v-model binding and label/for associations.

---

## 🧪 Tips

- Use `inputMode === 'manual' && !slabWidth` to allow custom width input
- Always handle updates through `updateReinforcementField(...)` or handlers like `handleTopBarChange(...)`

---

## 📁 File Location

This is likely used inside a larger component like `SlabInputs.vue`, and part of a structural engineering tool or builder form.
