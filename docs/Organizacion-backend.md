# Organización del backend y DTOs

Se mantiene una solución, una API y los nombres de negocio en español. El código se organiza por módulo; SQL y el lector PDF quedan en infraestructura. Esta etapa conserva rutas, tipos públicos, propiedades JSON, validaciones y lógica actuales. La adaptación funcional a los procedimientos nuevos sigue pendiente.

## Dónde buscar

Las rutas parten de `Control-Fertilizantes-App/Control-Fertilizantes-Backend/Control-Fertilizantes-Backend/`.

```text
Modulos/
  Catalogos/
    Productos/
    Proveedores/
    UnidadesMedida/
    Presentaciones/
  Compras/
    Analisis/
    ComparacionHistorica/
  Importaciones/
  Proformas/
Infraestructura/
  Persistencia/
    IConexionBD.cs
    ConexionBD.cs
    OpcionesConexionSql.cs
    Repositorios/  (agrupados por los mismos módulos)
  Pdf/ProformaPdfServicio.cs
Comun/
  Respuestas/ApiRespuesta.cs
  Errores/
Configuracion/RegistroDependencias.cs
Program.cs
```

Dentro de cada módulo, `Controladores`, `Servicios`, `Contratos`, `Modelos` y `DTOs` agrupan las responsabilidades que ya existen. Para cambiar el alta de producto se encuentran `ProductoCrearDTO` en `Modulos/Catalogos/Productos/DTOs/Entradas`, su servicio en `Productos/Servicios`, sus interfaces en `Productos/Contratos` y su repositorio en `Infraestructura/Persistencia/Repositorios/Catalogos/Productos`.

No se crean carpetas vacías para funcionalidades futuras. Productos base, marcas, solicitudes, documentos y comparación por solicitud se incorporarán con su implementación.

## Clasificación de los 43 contratos existentes

| Ubicación | Cantidad | Propósito |
|---|---:|---|
| DTOs/Entradas de cada módulo | 14 | Crear, actualizar, confirmar o cargar un archivo |
| DTOs/Salidas de cada módulo | 23 | Listados, opciones, detalles, resúmenes y vistas previas |
| Importaciones/DTOs/Internos | 4 | Búsquedas y equivalencias para conciliar el PDF |
| Importaciones/DTOs/Compartidos | 1 | Línea validada que la API antigua devuelve y vuelve a recibir |
| Comun/Respuestas | 1 | Envoltorio genérico ApiRespuesta |

Los DTOs no se fusionan por tener propiedades similares. Crear y actualizar son operaciones distintas; un resultado de búsqueda, una opción y un detalle público tienen propósitos diferentes. Tampoco se agregan DTOs por cada tabla SQL sin un caso de uso.

- Cada catálogo contiene sus entradas y salidas. `ProductoDropdownDTO` y `UnidadMedidaDropdownDTO` pertenecen a productos y unidades, aunque presentaciones los consuma.
- Compras contiene crear, actualizar, listar, detalle y último precio; Analisis agrupa cuatro salidas y ComparacionHistorica las cinco de `ComparadorProveedor`.
- Proformas contiene sus entradas de guardado y respuestas.
- Importaciones contiene vistas previas, conciliación y los cuatro DTOs de búsqueda sin endpoints propios.
- `ProformaPdfLineaValidadaDTO` es la única excepción compartida entre entrada y salida; deberá separarse al implementar extracción, corrección y confirmación del nuevo flujo.

Los archivos `ComparadorProveedorRespuestaDTO.cs` y `ComparadorProveedorDetalleRespuestaDTO.cs` ahora coinciden con sus clases. Se corrigió el namespace de plantilla `TuProyecto.Services`. Se conservan los nombres públicos existentes, incluidos los sufijos históricos Dropdown y Request, para mantener los identificadores de esquema.

Para contratos nuevos: nombres españoles que describan recurso y operación, sufijo DTO, archivo igual al tipo y carpeta según su uso real. Un contrato compartido necesita una razón explícita. Evitar una carpeta DTOs global y contratos de negocio en Comun.

## Dependencias

El controlador usa el servicio; el servicio usa contratos de repositorio del módulo; infraestructura los implementa con Dapper/SQL. `Configuracion/RegistroDependencias` conoce las implementaciones, agrupa su registro y conserva sus ciclos Scoped. `Program.cs` llama `AgregarBackend()` y configura HTTP.

Los namespaces siguen las carpetas. Dentro de una misma API, las carpetas no imponen aislamiento de ensamblados. Los modelos y contratos aún contienen decisiones heredadas: esta organización no supone una separación física de proyectos ni un nuevo modelo de dominio.

## Endpoints y adaptación posterior

Se mantienen nueve controladores y sus rutas. No se renombran sus clases porque `[controller]` forma parte de la URL.

| Controlador | Módulo | Adaptación funcional pendiente |
|---|---|---|
| Producto | Catalogos/Productos | Producto base y marca por identificador |
| Proveedor | Catalogos/Proveedores | Alinear entradas y resultados con SQL |
| UnidadMedida | Catalogos/UnidadesMedida | Dimensión y factores de normalización |
| PresentacionProducto | Catalogos/Presentaciones | Empaque y unidad; separar kg y litros |
| Compra | Compras | Compras reales separadas de ofertas |
| CompraInteligencia | Compras/Analisis | Revisar análisis de precios históricos y tipos |
| ComparadorProveedor | Compras/ComparacionHistorica | Conservar propósito histórico; implementar aparte comparación de cotizaciones por solicitud |
| CompraAutomatica | Importaciones | Sustituir por recepción/revisión; SQL ya rechaza convertir proformas en compras |
| ProformaProveedor | Proformas | Guardado atómico asociado a solicitud, destinatario y documento |

Deudas que este refactor conserva deliberadamente:

- `GuardarProformaProveedorDTO` contiene `Lineas` y `Detalles`; el servicio consume `Detalles`. Resolverlo al migrar el guardado, sin aceptar dos colecciones contradictorias.
- El repositorio de proformas recibe DTOs de entrada. El nuevo guardado debe separar transporte, operación validada y parámetros SQL cuando sus datos difieran.
- `IProformaPdfServicio` aún recibe IFormFile. Separarlo del transporte con stream/contenido al implementar documentos e importación revisable.
- La extracción convierte algunas ausencias en cero; indicadores de validación devueltos también se aceptan en confirmación. El nuevo flujo debe registrar ausencias, advertencias, correcciones y volver a validar en servidor.
- Hay identificadores C# int frente a SQL bigint. Migrarlos exige revisar parámetros, respuestas y consumidores juntos.

El siguiente paso es adaptar catálogos, comenzando por productos base, marcas y productos/presentaciones, según `database/contracts/Contratos-backend.md`.

## Verificación

`scripts/Probar-Backend.ps1` compila sin advertencias, ejecuta 61 pruebas y cinco comprobaciones HTTP sin SQL. Incluye resolución de dependencias de todos los controladores y comparación de OpenAPI con una referencia capturada de main antes de mover archivos: 39 rutas y 14 esquemas. La referencia está en `tests/GestorFertilizantes.Backend.Tests/Contratos/openapi-v1.json`.

OpenAPI describe principalmente las entradas: muchos métodos devuelven IActionResult sin publicar esquemas de respuesta. No equivale a probar toda la funcionalidad. Se comprobó además que los cuerpos de los 104 archivos trasladados no cambiaron, salvo imports y namespaces, conservando propiedades y anotaciones de DTOs.

Una migración funcional debe revisar las diferencias de OpenAPI antes de actualizar la referencia; no regenerarla automáticamente para hacer pasar CI. Docker con `-VerifyBackend` agrega pruebas SQL y HTTP usando el usuario limitado y una base temporal propia.
