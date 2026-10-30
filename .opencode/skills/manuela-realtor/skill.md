---
name: manuela-realtor
description: Reglas de migración a React, arquitectura de componentes, esquemas de Firebase y prevención de defectos para la plataforma inmobiliaria Manuela Bermúdez Realtor.
---

# Plataforma Inmobiliaria — Manuela Bermúdez Realtor (Reglas de Desarrollo)

Este proyecto es la migración de un sitio multipágina (HTML/JS/Bootstrap 4) a una SPA moderna con React y Firebase. El agente debe seguir estrictamente estas especificaciones en cada archivo generado o modificado.

---

## 1. Stack Tecnológico y Dependencias
- **Frontend:** React + React Router v6+ (un archivo de página por ruta).
- **Estilos e Íconos:** Bootstrap 5 (única versión, sin jQuery) + Font Awesome 5 + Lucide React.
- **Backend / DB:** Firebase 10.8.x (`firebase/auth`, `firebase/firestore`). Sin imports por CDN.
- **Moneda y Región:** Moneda COP con formateador único:
  ```javascript
  export const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);