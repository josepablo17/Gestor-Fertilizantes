# Frontend de cotizaciones

La aplicación abre en **Solicitudes de cotización**. Usa los estilos que ya existían en FertiControl. Los menús anteriores de compra automática y comparación libre se redirigen a Solicitudes; las compras y los análisis históricos conservan sus propias rutas.

1. Registra un producto base y, si corresponde, una marca. Crea el producto comercial, su presentación y los proveedores. El contenido normalizado lo calcula el backend.
2. Crea un borrador, selecciona las presentaciones y el número de empaques, añade los proveedores y emite la solicitud. Los renglones de la versión emitida quedan fijos.
3. En cada destinatario, genera o descarga su PDF. Compártelo por el canal que uses y registra el envío por separado.
4. Carga el PDF recibido. En la pantalla de revisión puedes ver o descargar el original, corregir cabecera y renglones, documentar alternativas o adicionales, confirmar los renglones y conciliar los importes. Puedes cancelar un borrador o crear una revisión de una respuesta finalizada.
5. Valida la respuesta y vuelve a la solicitud para comparar. Elige moneda, base y fecha. Los mínimos por kg o litro se muestran por renglón y los ajustes globales, una sola vez por proforma.

La carga de un PDF no crea una compra. Si el proveedor usa su propio formato, los campos empiezan en blanco para captura manual. Puedes consultar los valores originales de la extracción y el historial de ajustes.

## Arrancar en local

Requiere Node.js 24, .NET 10 fijado en `global.json` y Docker. Desde la raíz:

```powershell
./database/scripts/Invoke-DockerDatabase.ps1 -Action Up
./scripts/Iniciar-Backend.ps1
```

En otra terminal, entra a la carpeta `Control-Fertilizantes-Frontend/control-fertilizantes-app` y ejecuta:

```powershell
npm ci
npm run dev
```

Abre `http://localhost:5173`. El servidor de Vite envía `/api` a `http://localhost:5018`; puedes configurar otro destino con `GF_API_TARGET`. El build usa `/api` por defecto y requiere servir esa ruta hacia el backend. Si se usan orígenes distintos, fija `VITE_API_URL` al compilar y configura CORS en la API.

## Verificación

En la carpeta del frontend, `npm run lint`, `npm test` y `npm run build` comprueban estática, formatos de los cuerpos enviados y compilación. Para la prueba completa, instala Chromium con `npm exec -- playwright install chromium`. En Windows puedes usar un Chromium instalado indicando la ruta a su ejecutable en `GF_BROWSER_EXECUTABLE`.

Desde la raíz:

```powershell
./database/scripts/Invoke-DockerDatabase.ps1 -Action Test -VerifyBackend -VerifyFrontend
```

La prueba abre un navegador sin interfaz contra Vite y una API temporal. Escribe solo en la base y el volumen descartables de Compose. La evidencia se guarda en `artifacts/frontend`. CI comprueba el mismo flujo en Chromium.
