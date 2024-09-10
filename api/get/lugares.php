 <?php
// FICHERO: api/get/lugares.php
// =================================================================================
// PETICIONES GET ADMITIDAS:
// =================================================================================
//   api/lugares  -------------------> devuelve toda la información de todos los lugares
//   api/lugares/{ID} ---------------> devuelve toda la información del lugar con el ID que se le pasa
//   api/lugares/{ID}/valoraciones --> devuelve todas las valoraciones del lugar con el ID que se le pasa.
// ---------------------------------------------------------------------------------
// PARÁMETROS PARA LA BÚSQUEDA. DEVUELVE LOS REGISTROS QUE CUMPLAN TODOS LOS CRITERIOS DE BÚSQUEDA.
// SE PUEDEN COMBINAR TODOS LOS PARÁMETROS QUE SE QUIERA EN LA MISMA URL MEDIANTE EL OPERADOR &.
// EN LA CONSULTA EN LA BD SE UTILIZARÁ EL OPERADOR AND PARA COMBINAR TODOS LOS CRITERIOS ESPECIFICADOS.
//   api/lugares?n={texto} -> busca el texto indicado en el nombre. Devuelve la lista de registros que contengan en el nombre, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}. Por ejemplo: api/lugares?n=bar,cafetería
//   api/lugares?pb={texto} -> busca el texto indicado en población. Devuelve la lista de registros que contengan en poblacion, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}. Por ejemplo: api/lugares?pb=Alicante,Elche
//   api/lugares?pr={texto} -> busca el texto indicado en provincia. Devuelve la lista de registros que contengan en provincia, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}. Por ejemplo: api/lugares?n=bar,cafetería
//   api/lugares?e={texto} -> busca el texto indicado en las etiquetas del sitio. Devuelve la lista de registros que contengan entre sus etiquetas, al menos, una de las palabras, separadas por comas ",", indicadas en {texto}. Por ejemplo: api/lugares?n=bar,cafetería
//   api/lugares?vd={valoración desde}&vh={valoración hasta} -> búsqueda por valoración del lugar, desde-hasta. Se puede utilizar solo uno de los dos parámetros. Por ejemplo: api/lugares?vd=2&vh=5
// ---------------------------------------------------------------------------------
// PAGINACIÓN
//	 api/lugares?pag={página}&lpag={número de registros por página} -> devuelve los registros que están en la página que se le pide, tomando como tamaño de página el valor de lpag. Por ejemplo: api/lugares?n=Bar&pag=0&lpag=2
// =================================================================================
// INCLUSIÓN DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// RECURSO
// =================================================================================
if(strlen($_GET['prm']) > 0)
    $RECURSO = explode("/", substr($_GET['prm'],1));
else
    $RECURSO = [];
// Se pillan los parámetros de la petición
$PARAMS = array_slice($_GET, 1, count($_GET) - 1,true);
// =================================================================================
// =================================================================================
// FUNCIONES AUXILIARES
// =================================================================================
// =================================================================================

// =================================================================================
// Añade las condiciones de filtro (búsqueda)
// =================================================================================
// $valores -> Guardará los valores de los parámetros, ya que la consulta es preparada
// $params  -> Trae los parámetros de la petición
function aplicarFiltro(&$valores, $params)
{
    $filtroSQL = '';

    // BÚSQUEDA POR NOMBRE
    if( isset($params['n']) ) // búsqueda
    {
        if($filtroSQL != '') $filtroSQL .= ' and';
        $filtroSQL .= ' (false';

        $texto = explode(',', $params['n']);
        $paraNombre = '';
        foreach ($texto as $idx=>$valor) {
            $paraNombre .= ' or l.nombre like :NOMBRE' . $idx;
            $valores[':NOMBRE' . $idx] = '%' . trim($valor) . '%';
        }
        $filtroSQL .= $paraNombre . ')';
    }
    // BÚSQUEDA POR POBLACIÓN
    if( isset($params['pb']) ) // búsqueda
    {
        if($filtroSQL != '') $filtroSQL .= ' and';
        $filtroSQL .= ' (false';

        $texto = explode(',', $params['pb']);
        $paraPoblacion = '';
        foreach ($texto as $idx=>$valor) {
            $paraPoblacion .= ' or l.poblacion like :POBLACION' . $idx;
            $valores[':POBLACION' . $idx] = '%' . trim($valor) . '%';
        }
        $filtroSQL .= $paraPoblacion . ')';
    }
    // BÚSQUEDA POR PROVINCIA
    if( isset($params['pr']) ) // búsqueda
    {
        if($filtroSQL != '') $filtroSQL .= ' and';
        $filtroSQL .= ' (false';

        $texto = explode(',', $params['pr']);
        $paraPoblacion = '';
        foreach ($texto as $idx=>$valor) {
            $paraPoblacion .= ' or l.provincia like :PROVINCIA' . $idx;
            $valores[':PROVINCIA' . $idx] = '%' . trim($valor) . '%';
        }
        $filtroSQL .= $paraPoblacion . ')';
    }
    // BÚSQUEDA POR ETIQUETAS
    if( isset($params['e']) ) // búsqueda
    {
        if($filtroSQL != '') $filtroSQL .= ' and';

        $filtroSQL .= ' (false';
        $filtroSQL .= ' or l.id in (select le.id_lugar from etiqueta e,lugar_etiqueta le ';
        $filtroSQL .= 'where e.id=le.id_etiqueta and (false';
        $texto = explode(',', $params['e']);
        $paraEtiquetas = '';
        foreach ($texto as $idx=>$valor) {
            $paraEtiquetas .= ' or e.nombre like :ETIQUETA' . $idx;
            $valores[':ETIQUETA' . $idx] = '%' . trim($valor) . '%';
        }
        $filtroSQL .= $paraEtiquetas . ')))';
    }
    // BÚSQUEDA POR VALORACIÓN
    if( (isset($params['vd']) && is_numeric($params['vd']) ) || (isset($params['vh']) && is_numeric($params['vh']) ) )
    {
        $filtroSQL .= ' having';
        // * DESDE
        if( isset($params['vd']) )
        {
            $filtroSQL .= ' valoracion_media>=:VAL_DESDE';
            $valores[':VAL_DESDE'] = $params['vd'];
        }
        // * HASTA
        if( isset($params['vh']) )
        {
            if( isset($params['vd']) )
                $filtroSQL .= ' and';
            $filtroSQL .= ' valoracion_media<=:VAL_HASTA';
            $valores[':VAL_HASTA'] = $params['vh'];
        }
    }

    return $filtroSQL;
}
// =================================================================================
// CONFIGURACIÓN DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// SE PREPARA LA RESPUESTA
// =================================================================================
$R                   = [];  // Almacenará el resultado.
$RESPONSE_CODE       = 200; // código de respuesta por defecto: 200 - OK
$mysql               = '';  // para el SQL
$VALORES             = []; // Son los valores para hacer la consulta
$TOTAL_COINCIDENCIAS = -1;  // Total de coincidencias en la BD
// SE COGE EL ID DEL LUGAR, SI EXISTE
$ID = array_shift($RECURSO); // Se comprueba si se proporciona el id del registro
// =================================================================================
// SQL POR DEFECTO PARA SELECCIONAR TODOS LOS LUGARES
// =================================================================================
$mysql  = 'select l.id,l.nombre,l.poblacion,l.provincia, ';
if(is_numeric($ID))
    $mysql .= 'l.direccion,l.comentario, l.login, DATE_FORMAT(l.fecha_alta,"%Y-%m-%d") as fecha_alta, ';
$mysql .= '(select fichero from foto f where f.id_lugar=l.id order by id limit 1) as imagen,';
$mysql .= '(select count(*) from valoracion v where v.id_lugar=l.id) as nvaloraciones,';
$mysql .= '(select round(avg(v.puntuacion)) from valoracion v where v.id_lugar=l.id) as valoracion_media';
// =================================================================================
// SE SIGUE CON EL SQL ...
// =================================================================================
$mysql .= ' FROM lugar l';
// Se indica si se devuelve toda la información, es decir, si se añaden las etiquetas y las fotos a los datos del lugar
$info_completa = false;
// =================================================================================
// PRIMER NIVEL DE DECISIÓN: SE PIDEN DATOS DE UN REGISTRO CONCRETO O DE TODOS?
// =================================================================================
if(is_numeric($ID)) // Se debe devolver toda la información del registro con el id indicado
{
    switch (array_shift($RECURSO))
    {
        case 'valoraciones': // SE PIDEN LAS VALORACIONES DE UN LUGAR CONCRETO
                $mysql   = 'select v.login as usuario,u.foto as foto_usuario,DATE_FORMAT(v.fecha,"%Y-%m-%d") as fecha,v.titulo,v.texto,v.puntuacion from valoracion v, usuario u where v.id_lugar=:ID_LUGAR and v.login=u.login order by fecha ';
                $VALORES = [];
            break;
        case 'fotos': // SE PIDEN LAS FOTOS ASOCIADAS AL REGISTRO INDICADO
                $mysql   = 'select id,fichero from foto where id_lugar=:ID_LUGAR';
                $VALORES = [];
            break;
        default: // SE PIDE TODA LA INFORMACIÓN DE UN REGISTRO CONCRETO
                $mysql .= ' where l.id=:ID_LUGAR';
                $info_completa = true; // Hay que devolver toda la información
            break;
    }
    $VALORES[':ID_LUGAR'] = $ID;
}
else if( count($PARAMS) > 0 )
{
    // =================================================================================
    // SE AÑADE EL FILTRO EN FUNCIÓN DE LOS PARÁMETROS
    // =================================================================================
    $filtroSQL = aplicarFiltro($VALORES, $PARAMS);
    if($filtroSQL != ''){
        if(substr($filtroSQL,0, strlen(' having ')) == ' having ')
            $mysql .= $filtroSQL;
        else
            $mysql .= ' where' . $filtroSQL;
    }
    // =================================================================================
    // SE AÑADE EL ORDEN DE BÚSQUEDA
    // =================================================================================
    $mysql .= ' order by valoracion_media desc, nvaloraciones desc ';
}
// =================================================================================
// SE CONSTRUYE LA PARTE DEL SQL PARA PAGINACIÓN
// =================================================================================
if(isset($PARAMS['pag']) && is_numeric($PARAMS['pag'])      // Página a listar
    && isset($PARAMS['lpag']) && is_numeric($PARAMS['lpag']))   // Tamaño de la página
{
    $pagina           = $PARAMS['pag'];
    $regsPorPagina    = $PARAMS['lpag'];
    $ELEMENTO_INICIAL = $pagina * $regsPorPagina;
    $SQL_PAGINACION   = ' LIMIT ' . $ELEMENTO_INICIAL . ',' . $regsPorPagina;
    // =================================================================================
    // Para sacar el total de coincidencias que hay en la BD:
    // =================================================================================
    $stmt  = $dbCon->prepare($mysql);
    $stmt->execute($VALORES); // execute query
    $TOTAL_COINCIDENCIAS = $stmt->rowCount();
    $stmt->closeCursor();
    $mysql .= $SQL_PAGINACION;
}

// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
$stmt = $dbCon->prepare($mysql);
if($stmt->execute($VALORES)) // execute query OK
{
    $RESPONSE_CODE  = 200;
    $R['RESULTADO'] = 'OK';
    $R['CODIGO']    = $RESPONSE_CODE;
    $FILAS          = [];

    if($TOTAL_COINCIDENCIAS > -1)
    {
        $R['TOTAL_COINCIDENCIAS']  = $TOTAL_COINCIDENCIAS;
        $R['PAGINA']               = $pagina;
        $R['REGISTROS_POR_PAGINA'] = $regsPorPagina;
    }

    while( $row = $stmt->fetch(PDO::FETCH_ASSOC) )
    {
        if($info_completa)
        { // Significa que se pide un solo lugar. Hay que añadir las etiquetas y las fotos.
            // ETIQUETAS
            $etiqs = [];
            $mysql = 'select * from etiqueta e,lugar_etiqueta le where le.id_etiqueta=e.id and le.id_lugar=:ID_LUGAR';
            $stmt2 = $dbCon->prepare($mysql);
            if($stmt2->execute([':ID_LUGAR'=>$row['id']]))
            {
                while( $row2 = $stmt2->fetch(PDO::FETCH_ASSOC) )
                    $etiqs[] = $row2['nombre'];
                $stmt2->closeCursor();
            }
            $row['etiquetas'] = $etiqs;
            // FOTOS
            $fotos = [];
            $mysql = 'select * from foto where id_lugar=:ID_LUGAR';
            $stmt2 = $dbCon->prepare($mysql);
            if($stmt2->execute([':ID_LUGAR'=>$row['id']]))
            {
                while( $row2 = $stmt2->fetch(PDO::FETCH_ASSOC) )
                    $fotos[] = $row2['fichero'];
                $stmt2->closeCursor();
            }
            $row['fotos'] = $fotos;
        }
        $FILAS[] = $row;
    }
    $stmt->closeCursor();
    $R['FILAS'] = $FILAS;
}
else
{
    $RESPONSE_CODE    = 500;
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['RESULTADO']   = 'ERROR' ;
    $R['DESCRIPCION'] = 'Se ha producido un error en el servidor al ejecutar la consulta.';
}
// =================================================================================
// SE CIERRA LA CONEXION CON LA BD
// =================================================================================
$dbCon = null;
// =================================================================================
// SE DEVUELVE EL RESULTADO DE LA CONSULTA
// =================================================================================
http_response_code($RESPONSE_CODE);
echo json_encode($R);
?>
