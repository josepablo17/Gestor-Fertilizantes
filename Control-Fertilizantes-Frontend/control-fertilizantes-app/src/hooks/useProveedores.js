import { useCallback,useEffect,useState } from "react";
import {desactivarProveedor,obtenerProveedores} from "../api/proveedorApi";
import { mostrarConfirmacion,mostrarError,mostrarExito } from "../utils/alertas";

function useProveedores(recargar,onProveedorDesactivado){
    const [proveedores,setProveedores] = useState([]);
    const [cargando,setCargando] = useState(true);
    const [error,setError] = useState(null);


    const cargarProveedores = useCallback(async () =>{
        try{
            setCargando(true);
            setError(null);

            const data = await obtenerProveedores();
            setProveedores(data);
        }catch(err){
            setError("No se pueden cargar los proveedores.");
            console.error(err);
        }finally{
            setCargando(false);
        }
    },[]);


    useEffect(()=>{
        cargarProveedores();
    },[cargarProveedores,recargar]);

    const manejarDesactivar =  async (proveedor) =>{
        const resultado = await mostrarConfirmacion(
            "Desactivar proveedor",
            `¿Deseas desactivar el proveedor "${proveedor.nombre}"?`
        );

        if (!resultado.isConfirmed)
        {
            return false;
        }

        try{
            await desactivarProveedor(proveedor.idProveedor);
            await mostrarExito(
                "Proveedor desactivado",
                "El proveedor fue desactivado correctamente"
            );
            await cargarProveedores();

            if (onProveedorDesactivado){
                onProveedorDesactivado();
            }
            return true;
        } catch(err){
            await mostrarError(
                "Ocurrió un error",
                "No se pudo desactivar el proveedor."
            );
            console.error(err);
            return false;
        }
    };


    return{
        proveedores,
        cargando,
        error,
        cargarProveedores,
        manejarDesactivar
    };
}
export default useProveedores;