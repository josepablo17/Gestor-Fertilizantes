# Edición y saldos de presupuestos

## Antes de aprobar

Abrir el presupuesto y pulsar **Editar borrador**. Se pueden corregir el nombre, finca, período, moneda, rubros y montos iniciales, y agregar o quitar partidas. **Guardar borrador** conserva los cambios y **Cancelar edición** deja los datos anteriores. No se exige un motivo adicional. El borrador muestra montos planificados; los saldos se habilitan al aprobar.

Se mantiene el identificador del presupuesto y los de las partidas cuyos rubros continúan. La edición se realiza de forma conjunta y verifica que el presupuesto siga en borrador y que su versión no haya cambiado desde la consulta. La operación queda registrada automáticamente. Una vez aprobado o cerrado, los datos iniciales quedan protegidos.

## Después de aprobar

En **Saldos por partida**, pulsar **Cambiar monto** junto al rubro. Introducir el **Nuevo monto aprobado** y el **Motivo del ajuste**. La vista previa muestra el aprobado actual, lo reservado y gastado, el aumento o reducción y el disponible después del cambio.

Ejemplo: para pasar de ₡100.000 a ₡150.000, escribir **150000**. El sistema registra un aumento de ₡50.000 y conserva el monto inicial y el historial.

El cálculo es `disponible = aprobado − comprometido − ejecutado`. Una reducción no puede consumir dinero reservado o gastado. Se puede dejar una asignación en cero cuando no tiene reservas ni gasto. Si existe un exceso autorizado, un aumento puede cubrirlo parcialmente y la pantalla informa que todavía queda un importe por cubrir. Un monto idéntico al actual no genera un movimiento vacío.

La base de datos comprueba el monto aprobado esperado bajo el bloqueo presupuestario. Si otro usuario o pantalla lo modificó, devuelve un conflicto y pide recargar. Los presupuestos cerrados permiten consultar sus saldos e historial.

## Contratos y despliegue

- `PUT /api/presupuestos/{id}/borrador`: datos completos, partidas, `version` de la consulta e `idOperacion` nuevo. Devuelve el presupuesto actualizado.
- `POST /api/presupuestos/partidas/{id}/monto`: `nuevoMonto`, `montoAprobadoEsperado`, `motivo` e `idOperacion`. Los montos son explícitos y no negativos; la diferencia se calcula en SQL.
- La ruta anterior `/ajustes` y su procedimiento siguen disponibles para consumidores que envían diferencias.
- La actualización añade una referencia opcional a la última edición del presupuesto y dos procedimientos. El DACPAC conserva los registros existentes. Aplicarlo antes de iniciar la API nueva; en Docker, ejecutar `./database/scripts/Invoke-DockerDatabase.ps1 -Action Up` desde la raíz del repositorio.
