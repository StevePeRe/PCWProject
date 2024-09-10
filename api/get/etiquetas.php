 <?php
// FICHERO: api/get/etiquetas.php
// =================================================================================
// PETICIONES GET ADMITIDAS:
// =================================================================================
//   api/etiquetas  -------------------> devuelve todas las etiquetas
// =================================================================================
// INCLUSIÓN DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
// =================================================================================
// CONFIGURACIÓN DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// Se prepara la respuesta
// =================================================================================
$R             = [];  // Almacenará el resultado.
$RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
$mysql         = 'select nombre from etiqueta order by nombre';
// =================================================================================
// SE HACE LA CONSULTA
// =================================================================================
$stmt = $dbCon->prepare($mysql);
if($stmt->execute()) // execute query OK
{
    $RESPONSE_CODE  = 200;
    $R['RESULTADO'] = 'OK';
    $R['CODIGO']    = $RESPONSE_CODE;
    $FILAS          = [];

    while( $row = $stmt->fetch(PDO::FETCH_ASSOC) )
        $FILAS[] = $row['nombre'];
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
