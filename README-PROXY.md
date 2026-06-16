Proxy streaming (README)

Qué hace:
- Proporciona un endpoint `/stream` que solicita el stream upstream y reenvía los bytes al cliente.

Cómo probar localmente:
1. Instala dependencias:

```bash
npm install
```

2. Ejecuta el servidor:

```bash
UPSTREAM="https://uk26freenew.listen2myradio.com/live.mp3?typeportmount=s1_10571_stream_134072484" npm start
```

3. Abre en el navegador: http://localhost:3000/ y prueba el reproductor integrado.

Despliegue:
- Puedes desplegar en Render, Heroku, Railway o cualquier servicio que soporte Node.js.
- Para exponer localmente a la web usa `ngrok http 3000` y apunta el widget `MRP.insert` a `https://<tu-subdominio>.ngrok.io/stream`.

Limitaciones:
- Si el upstream devuelve HTML en lugar de audio, el proxy no podrá convertirlo en audio válido. El proxy simplemente reenvía los bytes que reciba.
- Para producción, configura `UPSTREAM` como variable de entorno en el host.
