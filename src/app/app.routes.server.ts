// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'board/:session',
    renderMode: RenderMode.Client // <-- Le dice a Angular: "Esto se renderiza solo en el navegador del usuario"
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender // El resto de la app (como el Home) se puede quedar prerenderizado
  }
];