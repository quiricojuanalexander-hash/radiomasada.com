Cloudflare Worker — Stream proxy para OREMRD

Objetivo
- Proveer un endpoint que reexpone el stream de audio añadiendo cabeceras CORS para permitir la reproducción desde tu dominio.

Archivos
- `worker.js` — script del Worker (proxies `/stream` o acepta `?u=` para especificar upstream).
- `wrangler.toml` — plantilla de configuración para `wrangler` (rellena `account_id`).

Despliegue rápido (CLI con Wrangler v2)
1. Instala Wrangler (si no lo tienes):

   ```bash
   npm install -g wrangler
   wrangler login
   ```

2. Desde la carpeta `workers/stream-proxy` publica:

   ```bash
   cd workers/stream-proxy
   wrangler publish
   ```

3. Al publicar verás una URL del tipo `https://<tu-worker>.workers.dev`. El endpoint para el stream será:

   - `https://<tu-worker>.workers.dev/stream`
   - o con upstream explícito: `https://<tu-worker>.workers.dev/stream?u=<encodeURIComponent(url)>`

Despliegue vía Cloudflare Dashboard
- Ve a Cloudflare → Workers → Create a Worker, pega el contenido de `worker.js`, guarda y crea una ruta (`example.com/stream`) o usa la URL `workers.dev` provista.

Actualizar el sitio
- Cambia la `src` del elemento `#main-radio` en `index.html` para apuntar al nuevo endpoint del Worker. Ejemplo:

  ```html
  <audio id="main-radio" preload="auto" playsinline crossorigin="anonymous" src="https://<tu-worker>.workers.dev/stream" style="display:none"></audio>
  ```

Pruebas
- Verifica que la respuesta incluya `Access-Control-Allow-Origin: *`:

  ```bash
  curl -I https://<tu-worker>.workers.dev/stream
  ```

Limitaciones y notas
- El Worker reenvía el stream en vivo. Cloudflare Workers aplican límites que pueden afectar conexiones largas; si necesitas conexiones de streaming muy largas/alta concurrencia considera un proxy en una VM o un servicio con sockets TCP persistentes.
- No compartas secretos ni `account_id` en repositorios públicos sin revisarlo antes.

Si quieres, puedo:
- Ayudarte a publicar el Worker (necesitarás autorizar via `wrangler login` en tu máquina), o
- Pegar el código en la consola de Workers y guiarte para enrutar `https://oremrd.org/stream` a ese Worker.
