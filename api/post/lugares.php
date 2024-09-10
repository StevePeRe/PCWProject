<?php
// FICHERO: api/post/lugares.php
// PETICIONES POST ADMITIDAS:
// Nota: Todas las operaciones deberán añadir a la petición POST una cabecera "Authorization" con el valor "{LOGIN}:{TOKEN}".
// * api/lugares -> Dar de alta un nuevo registro
//       Params: nombre:Nombre del lugar; direccion:Dirección del lugar (calle, avda, etc); poblacion:Población;
//               provincia:Provincia; comentario:Comentario sobre el lugar; etiquetas:Etiquetas asignadas al lugar (etiqueta1,
//               etiqueta2, ...); foto[]:array de fotos. Cada elemento del array es un input de tipo file
// * api/lugares/{ID}/valoracion -> Da de alta una valortacion para el lugar.
//       Params: titulo:título de la valoración; texto:texto de la valoración; puntuacion:puntuación de la
//               valoración (un valor entero entre 1 y 5)
// =================================================================================
// INCLUSIÓN DE LA CONEXIÓN A LA BD
// =================================================================================
require_once('../database.php');
// instantiate database and product object
$db    = new Database();
$dbCon = $db->getConnection();
// La instrucción siguiente es para poder recoger tanto errores como warnings que
// se produzcan en las operaciones sobre la BD (funciondes php errorCode() y errorInfo())
$dbCon->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING );
// =================================================================================
$RECURSO = explode("/", substr($_GET['prm'],1));
// =================================================================================
// CONFIGURACION DE SALIDA JSON Y CORS PARA PETICIONES AJAX
// =================================================================================
header("Access-Control-Allow-Orgin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");
// =================================================================================
// =================================================================================
// FUNCIONES AUXILIARES
// =================================================================================
// =================================================================================
/**
 * Copia el archivo indicado al servidor e inserta el correspondiente registro en la BD.
 * @param integer $ID - ID del lugar al que pertenece la foto
 * @param $_FILES['foto'] $FICHEROS - Array de ficheros de la petición POST de php
 * @param integer $NFOTO - Índice del fichero de foto de $_FILES a subir
 * @return integer - Retorna 0 si todo fue bien. Retorna -1 si hubo algún error al intentar guardar la foto en la BD. Retorna -2 si no se pudo guardar en disco. Retorna 2 si el tamaño del fichero es mayor al permitido.
*/
function subirFoto($ID, $FICHEROS, $NFOTO)
{
  global $dbCon, $pathFotos, $max_uploaded_file_size;

  $valor_retorno = -1;

  if($FICHEROS['size'][$NFOTO] <= $max_uploaded_file_size)
  {
    $mysql = 'insert into foto(id_lugar, fichero) values(:ID_LUGAR,:FICHERO);';

    $VALORES              = [];
    $VALORES[':ID_LUGAR'] = $ID;
    $VALORES[':FICHERO']  = ''; // nombre por defecto del archivo. Luego se cambia.

    $stmt = $dbCon->prepare($mysql);
    if( $stmt->execute($VALORES) )
    {
      $mysql = 'select max(ID) as id_fichero from foto';
      $stmt3 = $dbCon->prepare($mysql);
      if( $stmt3->execute() )
      {
        $row = $stmt3->fetch(PDO::FETCH_ASSOC);
        $stmt3->closeCursor();
        $ID_FICHERO = $row['id_fichero'];
        $ext = pathinfo($FICHEROS['name'][$NFOTO], PATHINFO_EXTENSION); // extensión del fichero
        $NOMBRE_FICHERO = 'foto' . $ID_FICHERO . '.' . $ext;
        $upload_dir = '../../' . $pathFotos . 'lugares/';
        $uploadfile = $upload_dir . $NOMBRE_FICHERO; // path fichero destino

        // Se comprueba si la carpeta existe y tiene permisos de escritura
        if (is_dir($upload_dir) && is_writable($upload_dir))
        {
          if(move_uploaded_file($FICHEROS['tmp_name'][$NFOTO], $uploadfile)) // se sube el fichero
          {
            $mysql = 'update foto set fichero=:FICHERO where id=:ID_FICHERO';
            $VALORES                = [];
            $VALORES[':FICHERO']    = $NOMBRE_FICHERO;
            $VALORES[':ID_FICHERO'] = $ID_FICHERO;

            $valor_retorno = 0; // Se guardó bien la foto
          }
          else
          { // No se ha podido copiar la foto. Hay que eliminar el registro
            $mysql = 'delete from fichero where id=:ID_FICHERO';
            $VALORES[':ID_FICHERO'] = $ID_FICHERO;
            $valor_retorno = -2;
          }
          // SE EJECUTA LA CONSULTA
          $stmt3 = $dbCon->prepare($mysql);
          $stmt3->execute($VALORES);
        }
      }
    }
  }
  else
  { // Archivo demasiado grande
    $valor_retorno = 2;
  }

  return $valor_retorno;
}
// =================================================================================
// Se pillan las cabeceras de la petición y se comprueba que está la de autorización
// =================================================================================
$headers = apache_request_headers();
// CABECERA DE AUTORIZACIÓN
if(isset($headers['Authorization']))
    $AUTORIZACION = $headers['Authorization'];
elseif (isset($headers['authorization']))
    $AUTORIZACION = $headers['authorization'];

if(!isset($AUTORIZACION))
{ // Acceso no autorizado
  $RESPONSE_CODE    = 403;
  $R['RESULTADO']   = 'ERROR';
  $R['CODIGO']      = $RESPONSE_CODE;
  $R['DESCRIPCION'] = 'Falta autorización';
}
else
{
  // =================================================================================
  // Se prepara la respuesta
  // =================================================================================
  $R             = [];  // Almacenará el resultado.
  $RESPONSE_CODE = 200; // código de respuesta por defecto: 200 - OK
  // =================================================================================
  // =================================================================================
  // Se supone que si llega aquí es porque todo ha ido bien y tenemos los datos correctos
  // de la nueva entrada, NO LAS FOTOS. Las fotos se suben por separado una vez se haya
  // confirmado la creación correcta de la entrada.
  $PARAMS = $_POST;
  list($login,$token) = explode(':', $AUTORIZACION);

  if( !$db->comprobarSesion($login,$token) )
  {
    $RESPONSE_CODE    = 401;
    $R['RESULTADO']   = 'ERROR';
    $R['CODIGO']      = $RESPONSE_CODE;
    $R['DESCRIPCION'] = 'Error de autenticación.';
  }
  else
  {
    $ID = array_shift($RECURSO);
    try{
      $dbCon->beginTransaction();
      if(!is_numeric($ID)) // NUEVO REGISTRO
      { // Si no es numérico $ID es porque se está creando un nuevo registro
        $nombre     = $PARAMS['nombre'];
        $direccion  = $PARAMS['direccion'];
        $poblacion  = $PARAMS['poblacion'];
        $provincia  = $PARAMS['provincia'];
        $comentario = nl2br($PARAMS['comentario'],false);
        // =================================================================================
        $mysql  = 'insert into lugar(nombre,direccion,poblacion,provincia,comentario,login) ';
        $mysql .= 'values(:NOMBRE,:DIRECCION,:POBLACION,:PROVINCIA,:COMENTARIO,:LOGIN)';
        $VALORES                = [];
        $VALORES[':NOMBRE']     = $nombre;
        $VALORES[':DIRECCION']  = $direccion;
        $VALORES[':POBLACION']  = $poblacion;
        $VALORES[':PROVINCIA']  = $provincia;
        $VALORES[':COMENTARIO'] = $comentario;
        $VALORES[':LOGIN']      = $login;
        $stmt = $dbCon->prepare($mysql);
        if( $stmt->execute($VALORES) )
        { // Se han insertado los datos del registro
          // Se saca el id del nuevo registro
          $mysql2 = "select MAX(id) as id_lugar from lugar";
          $stmt2 = $dbCon->prepare($mysql2);
          if($stmt2->execute())
          {
            $registro = $stmt2->fetch(PDO::FETCH_ASSOC);
            $ID = $registro['id_lugar'];
          }
          else $ID = -1;
          $stmt2->closeCursor();
          // ===============================
          // Si hay fotos, hay que guardarlas
          // ===============================
          $fotos = [];

          if($_FILES['foto']['error'][0] != UPLOAD_ERR_NO_FILE)
          { // Hay ficheros que guardar
            for($i=0;$i<count($_FILES['foto']['name']);$i++)
            {
              $val_ret = subirFoto($ID, $_FILES['foto'], $i);
              $fotoSubida             = [];
              $fotoSubida['NOMBRE']   = $_FILES['foto']['name'][$i];
              $fotoSubida['GUARDADA'] = ($val_ret == 0)?'SI':'NO';
              if($val_ret !=0)
              {
                switch($val_ret)
                {
                  case -1: // Error al intentar guardar la foto en la BD
                      $fotoSubida['ERROR'] = 'No se ha podido guardar la foto en la BD. Error del servidor o la BD no está creada.';
                    break;
                  case -2: // Error al intentar guardar la foto en disco
                      $fotoSubida['ERROR'] = 'No se ha podido copiar la foto al servidor. Revisa los permisos de la carpeta en la que se guardan las fotos.';
                    break;
                  case 2: // No se guarda la foto porque pesa más de lo permitido
                      $fotoSubida['ERROR'] = 'No se ha podido guardar la foto porque pesa más de lo permitido (' . ($max_uploaded_file_size/1024) . 'KB)';
                    break;
                }
              }
              array_push($fotos, $fotoSubida);
            }
          }
          // ===============================
          // Si hay etiquetas, hay que insertar las nuevas y asignarlas al lugar
          // ===============================
          $etiquetas = explode(',', $PARAMS['etiquetas']);
          foreach ($etiquetas as $idx=>$valor) {
            $mysql = 'select id from etiqueta where nombre=:NOMBRE';
            $VALORES = [':NOMBRE'=>$valor];
            $stmt = $dbCon->prepare($mysql);
            if($stmt->execute($VALORES))
            {
              if($stmt->rowCount() > 0)
              { // La etiqueta existe
                $registro    = $stmt->fetch(PDO::FETCH_ASSOC);
                $ID_ETIQUETA = $registro['id'];
                $stmt->closeCursor();
              }
              else
              { // Nueva etiqueta
                $stmt->closeCursor();
                $mysql = 'insert into etiqueta(nombre) values(:NOMBRE)';
                $stmt = $dbCon->prepare($mysql);
                if($stmt->execute($VALORES))
                { // Creada la nueva etiqueta
                  $mysql = 'select MAX(id) as id_etiqueta from etiqueta';
                  $stmt2 = $dbCon->prepare($mysql);
                  if($stmt2->execute())
                  {
                    $registro = $stmt2->fetch(PDO::FETCH_ASSOC);
                    $ID_ETIQUETA = $registro['id_etiqueta'];
                  }
                  $stmt2->closeCursor();
                }
              }
              // Hay que introducir el registro correspondiente en la tabla lugar_etiqueta
              $mysql = 'insert into lugar_etiqueta(id_lugar,id_etiqueta) values(:ID_LUGAR,:ID_ETIQUETA)';
              $VALORES                 = [];
              $VALORES[':ID_LUGAR']    = $ID;
              $VALORES[':ID_ETIQUETA'] = $ID_ETIQUETA;
              $stmt = $dbCon->prepare($mysql);
              if(!$stmt->execute($VALORES))
                echo "ERROR: " . $ID_ETIQUETA . "\n";
            }
          } // foreach ...
          // Se prepara la respuesta
          $RESPONSE_CODE    = 201;
          $R['RESULTADO']   = 'OK';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Registro creado correctamente';
          $R['ID']          = $ID;
          $R['NOMBRE']      = $nombre;
          $R['FOTOS']       = $fotos;
        }
        else
        {
          $RESPONSE_CODE    = 500;
          $R['RESULTADO']   = 'ERROR';
          $R['CODIGO']      = $RESPONSE_CODE;
          $R['DESCRIPCION'] = 'Error de servidor.';
        }
      }
      else
      { // El $ID es numérico por lo que se va a guardar una valoración
        switch(array_shift($RECURSO))
        {
          case 'valoracion': // Se va a añadir una valoración
              $mysql  = 'insert into valoracion(id_lugar,login,titulo,texto,puntuacion) ';
              $mysql .=  'values(:ID_LUGAR,:LOGIN,:TITULO,:TEXTO,:PUNTUACION);';

              $VALORES                = [];
              $VALORES[':ID_LUGAR']   = $ID;
              $VALORES[':LOGIN']      = $login;
              $VALORES[':TITULO']     = $PARAMS['titulo'];
              $VALORES[':TEXTO']      = nl2br($PARAMS['texto']);
              $VALORES[':PUNTUACION'] = $PARAMS['puntuacion'];

              $stmt = $dbCon->prepare($mysql);
              if( $stmt->execute($VALORES) )
              {
                // ===============================================================
                // Se ha guardado el comentario correctamente.
                $mysql2 = "select MAX(id) as id_valoracion from valoracion";
                $stmt2 = $dbCon->prepare($mysql2);
                if($stmt2->execute())
                {
                  $registro = $stmt2->fetch(PDO::FETCH_ASSOC);
                  $ID_VALORACION = $registro['id_valoracion'];
                }
                else $ID_VALORACION = -1;
                $stmt2->closeCursor();

                $RESPONSE_CODE      = 201;
                $R['RESULTADO']     = 'OK';
                $R['CODIGO']        = $RESPONSE_CODE;
                $R['DESCRIPCION']   = 'Valoracion guardada correctamente.';
                $R['ID_VALORACION'] = $ID_VALORACION;
                // ===============================================================
              }
              else
              {
                $RESPONSE_CODE    = 500;
                $R['RESULTADO']   = 'ERROR';
                $R['CODIGO']      = $RESPONSE_CODE;
                $R['DESCRIPCION'] = 'Se ha producido un error al intentar guardar la valoración.';
              }
            break;
        }
      }
      $dbCon->commit();
    }catch(Exception $e){
      echo $e;
      $dbCon->rollBack();
    }
  } // if( !comprobarSesion($login,$clave) )
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