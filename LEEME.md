# Registro Anestésico Digital — Instalación local

## Requisitos

- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation) (gestor de paquetes)

Si no tiene pnpm instalado, ejecute una sola vez:
```
npm install -g pnpm
```

## Pasos para ejecutar en local

1. Abrir esta carpeta en Visual Studio Code
2. Abrir la terminal integrada (Ctrl+` o Terminal → Nueva terminal)
3. Instalar dependencias:
   ```
   pnpm install
   ```
4. Iniciar el servidor de desarrollo:
   ```
   pnpm dev
   ```
5. Abrir en el navegador: **http://localhost:5000**

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Compilar para producción |
| `pnpm start` | Iniciar versión de producción (requiere `pnpm build` previo) |

## Tecnologías

- Next.js 16 + React 19
- Tailwind CSS + Radix UI
- TypeScript
- PWA (instalable en iPhone/Android)
