//general
let cont_lugares;
let cont_fotos=0;

function foto(imgs) {
    const IMAGENES = imgs;

    const TIEMPO_INTERVALO_MILESIMAS_SEG = 1000;
    let posicionActual = 0;
    let $botonRetroceder = document.querySelector('#retroceder');
    let $botonAvanzar = document.querySelector('#avanzar');
    let $botonPlay = document.querySelector('#play');
    let $botonStop = document.querySelector('#stop');
    let intervalo;

    // Funciones
    /**
     * Funcion que cambia la foto en la siguiente posicion
     */
    function pasarFoto() {
        if (posicionActual >= IMAGENES.length - 1) {
            posicionActual = 0;
        } else {
            posicionActual++;
        }
        renderizarImagen();
    }
    /**
     * Funcion que cambia la foto en la anterior posicion
     */
    function retrocederFoto() {
        if (posicionActual <= 0) {
            posicionActual = IMAGENES.length - 1;
        } else {
            posicionActual--;
        }
        renderizarImagen();
    }
    /**
     * Funcion que actualiza la imagen de imagen dependiendo de posicionActual
     */
    function renderizarImagen() {
        let img = document.querySelector('#img_lugar');
        img.src = "fotos/lugares/" + IMAGENES[posicionActual];
        // $imagen.style.backgroundImage = `url(${IMAGENES[posicionActual]})`;
    }
    /**
     * Activa el autoplay de la imagen
     */
    function playIntervalo() {
        intervalo = setInterval(pasarFoto, TIEMPO_INTERVALO_MILESIMAS_SEG);
        // Desactivamos los botones de control
        $botonAvanzar.setAttribute('disabled', true);
        $botonRetroceder.setAttribute('disabled', true);
        $botonPlay.setAttribute('disabled', true);
        $botonStop.removeAttribute('disabled');
    }
    /**
     * Para el autoplay de la imagen
     */
    function stopIntervalo() {
        clearInterval(intervalo);
        // Activamos los botones de control
        $botonAvanzar.removeAttribute('disabled');
        $botonRetroceder.removeAttribute('disabled');
        $botonPlay.removeAttribute('disabled');
        $botonStop.setAttribute('disabled', true);
    }
    // Eventos
    $botonAvanzar.addEventListener('click', pasarFoto);
    $botonRetroceder.addEventListener('click', retrocederFoto);
    $botonPlay.addEventListener('click', playIntervalo);
    $botonStop.addEventListener('click', stopIntervalo);
    // Iniciar
    renderizarImagen();
}
var a;
window.onload = function () {
    ContLugares();
    PedirLugares();
    InfoLugares();
    Menu();
    CargarValoraciones();
    comentario_no_logueado();



}

function ContLugares() {
    let url = 'api/lugares';
    let init = { method: 'GET' };
    cont_lugares = false;

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                var cont = 0;
                datos.FILAS.forEach(function (e, idx, v) {
                    cont = cont + 1;
                });
                var num = cont / 6;
                console.log("ESTOY EN CONTLUGARES");
                console.log(num);
                // se el numero de paginas que hay
                cont_lugares = num;
            });
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
}

//Login
function hacerLogin(frm) {

    let url = 'api/usuarios/login';
    let fd = new FormData(frm);
    let init = { method: 'POST', body: fd };

    fetch(url, init).then(function (response) {

        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                var bol = document.getElementById('marcado');
                console.log(bol);
                if (bol.checked) {
                    console.log("entra en localStorage");
                    localStorage['pcw'] = JSON.stringify(datos);
                    if (sessionStorage.getItem("pcw") != null) {

                    }
                    MensajeLoginBien();
                } else {
                    console.log("entra en sessionStorage");
                    sessionStorage['pcw'] = JSON.stringify(datos);
                    MensajeLoginBien();
                }

            });

        } else {
            MensajeLoginMal();
            console.log('Error' + response.status + ': ' + response.statusText);
        }

    });

    return false;
}

function MensajeLoginBien() {

    let div = document.createElement('div');
    let html;
    let a
    if (localStorage.getItem("pcw") != null) {
        a = JSON.parse(localStorage['pcw']);
    } else {
        a = JSON.parse(sessionStorage['pcw']);
    }

    div.id = 'msj-modal';
    html = `<article>
                <h2>Usuario correcto</h2>
                <p>El usuario ${a.LOGIN}, se ha logueado correctamente</p>
                <button onclick="BotonLogin();">Cerrar</button>
            </article>`;

    div.innerHTML = html;

    document.body.appendChild(div);
}

function MensajeLoginMal() {

    let div = document.createElement('div');
    let html;

    div.id = 'msj-modal';
    html = `<article>
                <h2>Usuario incorrecto</h2>
                <p>El usuario que has ingresado o la contraseña no están en nuestra base de datos, inténtalo de nuevo.</p>
                <button onclick="BotonLogin1();">Cerrar</button>
            </article>`;

    div.innerHTML = html;

    document.body.appendChild(div);
}

function BotonLogin1() {

    document.querySelector('#msj-modal').remove();
    document.getElementById("my_form").reset();
    document.getElementById("login").focus();

}

function BotonLogin() {

    document.querySelector('#msj-modal').remove();
    window.location.replace("index.html");

}

//PedirRutas para el index
function PedirLugares() {
    console.log("hey");
    // let url = 'api/rutas?pag={' + cont + '}&lpag={6}';
    let url = 'api/lugares?pag=0&lpag=6';
    let init = { method: 'GET' };

    let div = document.getElementById('disposicion1');
    let html = '';
    let html2 = '';

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                var bolmedia = false;
                var media;
                var num;
                var cont = 0;
                // sessionStorage['ids'] = datos.FILAS[0].id;
                /*let ul = document.createElement('ul');*/
                datos.FILAS.forEach(function (e, idx, v) {
                    // pillo el numero de valoracion y si tiene en su nombre la palabra media(para dibujar la media estrella)
                    if (e.valoracion_media.split(" ").length > 1) {
                        console.log("entro en el if");
                        media = e.valoracion_media.split(" ")[2];
                        console.log(media);
                        bolmedia = true;
                    } else {
                        num = e.valoracion_media.split(" ")[0];
                        console.log(num);
                        bolnum = true;
                    }

                    // <i class="icon-star-1"></i><i class="icon-star-1"></i>
                    //                             <i class="icon-star-1"></i><i class="icon-star-half-alt"></i>
                    //                             <i class="icon-star-empty-1"></i>

                    html = html + `<article>
                                        <a class="txt" href="lugar.html?${e.id}">
                                            <h4>${e.nombre}</h4>
                                        </a>
                                        <a class="contenedor" href="lugar.html?${e.id}">
                                            <img class="imagen" src="fotos/lugares/${e.imagen}" alt="imagen 1" width="470" height="320">
                                        </a>

                                        <div class="valoracion_index">
                                            <div class="p_valoracion">`;
                    // proceso para dibujar las estrellas segun la valoracion
                    for (i = 0; i < parseInt(num, 10); i++) {
                        // dibuja lasestrellas llenas
                        html = html + `<i class="icon-star-1"></i>`;
                    }
                    if (bolmedia == false) {
                        if (parseInt(num, 10) < 5) {
                            for (j = parseInt(num, 10); j < 5; j++) {
                                // dibuja lasestrellas vacias
                                html = html + `<i class="icon-star-empty-1"></i>`;
                            }
                        }
                    } else {
                        // dibuja la mitad de estrella
                        html = html + `<i class="icon-star-half-alt"></i>`;
                        for (k = parseInt(num, 10) + 1; k < 5; k++) {
                            // dibuja las estrellas vacias
                            html = html + `<i class="icon-star-empty-1"></i>`;
                        }
                    }
                    html = html + `<a class="hover_enlace" href="lugar.html"> ${e.nvaloraciones}</a>
                                            </div>
                                            <p class="tooltip"> ${e.poblacion}(${e.provincia})
                                                <span class="tooltiptext">${e.poblacion}(${e.provincia})</span>
                                            </p>
                                        </div>
                                    </article>`;
                    cont = cont + 1;
                    console.log(cont);
                });
                html2 = html;
                // onclick="NuevaPag(${html2},${cont33})"
                if (cont_lugares > 1) {
                    var cont33 = 1;
                    html = html + `<button class="boton2" onclick="NuevaPag()">
                                        Mostrar más
                                    </button >`;
                }
                if (div != null) {
                    div.innerHTML = html;
                    div.appendChild;
                    // document.body.appendChild(div);
                }
            });
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
    return false;
}

function NuevaPag() {
    console.log("csvfdvd");
    // console.log("HOLAAA");
    let url = 'api/lugares?pag={' + cont_lugares + '}&lpag=6';
    let init = { method: 'GET' };

    let div = document.getElementById('disposicion1');
    let html = html2;
    cont_lugares = cont_lugares - 1;

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                var bolmedia = false;
                var media;
                var num;
                // sessionStorage['ids'] = datos.FILAS[0].id;
                /*let ul = document.createElement('ul');*/
                datos.FILAS.forEach(function (e, idx, v) {
                    // pillo el numero de valoracion y si tiene en su nombre la palabra media(para dibujar la media estrella)
                    if (e.valoracion_media.split(" ").length > 1) {
                        console.log("entro en el if");
                        media = e.valoracion_media.split(" ")[2];
                        console.log(media);
                        bolmedia = true;
                    } else {
                        num = e.valoracion_media.split(" ")[0];
                        console.log(num);
                        bolnum = true;
                    }
                    html = html + `<article>
                                        <a class="txt" href="lugar.html?${e.id}">
                                            <h4>${e.nombre}</h4>
                                        </a>
                                        <a class="contenedor" href="lugar.html?${e.id}">
                                            <img class="imagen" src="fotos/lugares/${e.imagen}" alt="imagen 1" width="470" height="320">
                                        </a>

                                        <div class="valoracion_index">
                                            <div class="p_valoracion">`;
                    // proceso para dibujar las estrellas segun la valoracion
                    for (i = 0; i < parseInt(num, 10); i++) {
                        // dibuja lasestrellas llenas
                        html = html + `<i class="icon-star-1"></i>`;
                    }
                    if (bolmedia == false) {
                        if (parseInt(num, 10) < 5) {
                            for (j = parseInt(num, 10); j < 5; j++) {
                                // dibuja lasestrellas vacias
                                html = html + `<i class="icon-star-empty-1"></i>`;
                            }
                        }
                    } else {
                        // dibuja la mitad de estrella
                        html = html + `<i class="icon-star-half-alt"></i>`;
                        for (k = parseInt(num, 10) + 1; k < 5; k++) {
                            // dibuja las estrellas vacias
                            html = html + `<i class="icon-star-empty-1"></i>`;
                        }
                    }
                    html = html + `<a class="hover_enlace" href="lugar.html"> ${e.nvaloraciones}</a>
                                            </div>
                                            <p class="tooltip"> ${e.poblacion}(${e.provincia})
                                                <span class="tooltiptext">${e.poblacion}(${e.provincia})</span>
                                            </p>
                                        </div>
                                    </article>`;
                });
                html2 = html;
                if (cont_lugares > 1) {
                    cont_lugares = cont_lugares + 1;
                    html = html + `<button class="boton2" onclick="NuevaPag()">
                                        Mostrar más
                                    </button >`;
                }
                if (div != null) {
                    div.innerHTML = html;
                    div.appendChild;
                    // document.body.appendChild(div);
                }
            });
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
}

// Registro
function hacerRegistro(frm) {

    let url = 'api/usuarios/registro';
    let fd = new FormData(frm);

    let init = { method: 'POST', body: fd };
    console.log(fd);
    fetch(url, init).then(function (response) {
        if (response.ok) {

            document.getElementById("my_register").reset();
            response.json().then(function (datos) {

                console.log(datos);
                MensajeRegistroBien();
            });
        } else {
            MensajeRegistroMal();
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
    return false;
}

function MensajeRegistroBien() {
    let div = document.createElement('div');
    let html;
    div.id = 'msj-modal';
    html = `<article>
                <h2>Registro correcto</h2>
                <p>Te has registrado correctamente</p>
                <button onclick="BotonRegistro();">Cerrar</button>
            </article>`;
    div.innerHTML = html;
    document.body.appendChild(div);
}

function BotonRegistro() {
    document.querySelector('#msj-modal').remove();
    window.location.replace("login.html");
}

function MensajeRegistroMal() {
    let div = document.createElement('div');
    let html;
    div.id = 'msj-modal';
    html = `<article>
                <h2>El registro no se puede llevar acabo</h2>
                <p>El usuario que has ingresado ya existe o las contraseñas no coinciden, inténtalo de nuevo.</p>
                <button onclick="BotonRegistro1();">Cerrar</button>
            </article>`;
    div.innerHTML = html;
    document.body.appendChild(div);
}

function BotonRegistro1() {
    document.querySelector('#msj-modal').remove();
    document.getElementById("my_register").reset();
    document.getElementById("login").focus();
}

//Registro comprobar login
function RegistroLogin() {
    if (document.getElementById('login2').value == "") {
        console.log("no hay valor");
    } else {
        var comp = document.getElementById('login2').value;
        RegistroLoginComprueba(comp);
    }
}

function RegistroLoginComprueba(login) {
    let comprueba = document.getElementById('Compruebaa');
    let html = '';
    let url = 'api/usuarios/' + login;
    let init = { method: 'GET' };

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                var a = JSON.stringify(datos);
                var b = JSON.parse(a);
                if (b.DISPONIBLE == true) {
                    html = ` <div class="Comprueba_Usu">Usuario disponible
                    </div>`;
                } else {
                    html = ` <div class="Comprueba_Usu">Usuario no disponible
                    </div>`;
                }
                comprueba.innerHTML = html;
            });
        }
    });
    return false;
}

//Registro comprobar password
function RegistroPassword() {
    let comprueba = document.getElementById('Compruebaa2');
    var comp1 = document.getElementById('pwd').value;
    var comp2 = document.getElementById('pwd2').value;
    let html = '';

    if (comp1 === comp2) {

    } else {
        html = ` <div class="Comprueba_Usu">Las contraseñas no coinciden
                    </div>`;
    }
    comprueba.innerHTML = html;

}
function Comprobar_Imagen() {

    // Comprobar tamaño bytes de imagen
    const MAXIMO_TAMANIO_BYTES = 300000; // 1MB = 1 millón de bytes

    // Obtener referencia al elemento
    const $miInput = document.querySelector("#foto");

    $miInput.addEventListener('change', function () {
        console.log("ola");
        // si no hay archivos, regresamos

        if (this.files.length <= 0) return;

        // Validamos el primer archivo únicamente
        const archivo = this.files[0];

        if (archivo.size > MAXIMO_TAMANIO_BYTES) {
            const tamanioEnMb = MAXIMO_TAMANIO_BYTES / 1000000;
            alert(`El tamaño máximo es ${tamanioEnMb} MB`);
            // Limpiar
            $miInput.value = "";
        } else {
            // Validación pasada
            console.log("imagen de buen tamaño");
        }
    });

}

function previsuImg(inpFile) {
    let img = document.querySelector('#preview'),
        file = inpFile.files[0],
        reader = new FileReader();

    reader.onload = function () {
        // la operacion de lectura ha finalizado correctamente
        img.src = reader.result;
    }
    if (file) {
        reader.readAsDataURL(file);
    } else {
        img.src = "fotos/usuarios/sin_imagen.jpg";
    }
}

function Borrar_Imagen() {
    document.getElementById("foto").value = "";
    document.getElementById("foto2").value = "";
    document.getElementById("preview").src = "fotos/usuarios/sin_foto.png";
}

//Logout
function hacerLogout() {
    //https://localhost/pcw/practica2/
    let url = 'api/usuarios/logout';
    let usu;
    let init;
    let valor;
    if (!sessionStorage['pcw'] && !localStorage['pcw']) {
        return;
    } else if (localStorage['pcw']) {
        usu = JSON.parse(localStorage['pcw']);
    } else {
        usu = JSON.parse(sessionStorage['pcw']);
    }

    valor = usu.LOGIN + ':' + usu.TOKEN;
    init = { method: 'POST', headers: { 'Authorization': valor } };

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                sessionStorage.removeItem('pcw');
                localStorage.removeItem('pcw');
            });
            window.location.replace("index.html");
        } else {
            console.log('Error' + response.status + ': ' + response.statusText);
        }
    });
}

// LUGAR
function InfoLugares() {

    var URLactual = window.location;
    var id = URLactual.href.split("?")[1];
    console.log(id);
    let html = '';
    let html2 = '';
    let url = 'api/lugares/' + id;
    let init = { method: 'GET' };
    let div = document.getElementById('info_lugar');
    let div2 = document.getElementById('foto_lugar');

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                var bolmedia = false;
                var media;
                var num;
                // sessionStorage['ids'] = datos.FILAS[0].id;
                /*let ul = document.createElement('ul');*/
                datos.FILAS.forEach(function (e, idx, v) {
                    // pillo el numero de valoracion y si tiene en su nombre la palabra media(para dibujar la media estrella)
                    if (e.valoracion_media.split(" ").length > 1) {
                        console.log("entro en el if");
                        media = e.valoracion_media.split(" ")[2];
                        console.log(media + "entro en infolugares");
                        bolmedia = true;
                    } else {
                        num = e.valoracion_media.split(" ")[0];
                        console.log(num + "entro en infolugares else");
                        bolnum = true;
                    }

                    // fotos
                    imagenes = e.fotos;

                    foto(imagenes);

                    html = html + `<a>Nombre:</a><a> ${e.nombre}</a> <br>
                                    <a>Dirección:</a><a> ${e.direccion}</a> <br>
                                    <a>Población:</a><a> ${e.poblacion}</a> <br>
                                    <a>Provincia:</a><a> ${e.provincia}</a> <br>
                                    <a>Valoración:</a>`;
                    // proceso para dibujar las estrellas segun la valoracion
                    for (i = 0; i < parseInt(num, 10); i++) {
                        // dibuja lasestrellas llenas
                        html = html + `<i class="icon-star-1"></i>`;
                    }
                    if (bolmedia == false) {
                        if (parseInt(num, 10) < 5) {
                            for (j = parseInt(num, 10); j < 5; j++) {
                                // dibuja lasestrellas vacias
                                html = html + `<i class="icon-star-empty-1"></i>`;
                            }
                        }
                    } else {
                        // dibuja la mitad de estrella
                        html = html + `<i class="icon-star-half-alt"></i>`;
                        for (k = parseInt(num, 10) + 1; k < 5; k++) {
                            // dibuja las estrellas vacias
                            html = html + `<i class="icon-star-empty-1"></i>`;
                        }
                    }
                    html = html + `<a class="hover_enlace" href="#salto_comentario"> ${e.nvaloraciones} valoraciones</a>
                                    <p>Comentario: ${e.comentario}</p>
                                    <a>Etiquetas:</a>`;
                    for (z = 0; z < e.etiquetas.length; z++) {
                        html = html + `<a class="hover_enlace" href="buscar.html?${e.etiquetas[z]}"> ${e.etiquetas[z]} | </a> `;
                    }

                });

                if (div != null) {
                    div.innerHTML = html;
                    div.appendChild;
                    // document.body.appendChild(div);
                }



            });
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
    return false;
}

function CargarValoraciones() {

    var URLactual = window.location;
    var id = URLactual.href.split("?")[1];
    if(id.split("#").length > 1){
        id = id.split("#")[0];
    }
    let url = 'api/lugares/' + id + '/valoraciones';
    let init = { method: 'GET' };
    let div = document.getElementById('valoraciones');
    let html = '';
    var Fecha;
    var FechaRuta = '';

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                var bolmedia = false;
                var media;
                var num;
                var puntu;
                console.log(datos);
                datos.FILAS.forEach(function (e, idx, v) {

                    puntu = String(e.puntuacion);

                    if (puntu.split(" ").length > 1) {
                        console.log("entro en el if");
                        media = puntu.split(" ")[2];
                        console.log(media);
                        bolmedia = true;
                    } else {
                        num = puntu;
                        console.log(num);
                        bolnum = true;
                    }

                    Fecha = new Date(e.fecha);

                    if (Fecha.getDay() == 1) {
                        FechaRuta = FechaRuta + "Lunes";
                    } else if (Fecha.getDay() == 2) {
                        FechaRuta = FechaRuta + "Martes";
                    } else if (Fecha.getDay() == 3) {
                        FechaRuta = FechaRuta + "Miércoles";
                    } else if (Fecha.getDay() == 4) {
                        FechaRuta = FechaRuta + "Jueves";
                    } else if (Fecha.getDay() == 5) {
                        FechaRuta = FechaRuta + "Viernes";
                    } else if (Fecha.getDay() == 6) {
                        FechaRuta = FechaRuta + "Sábado";
                    } else if (Fecha.getDay() == 0) {
                        FechaRuta = FechaRuta + "Domingo";
                    }

                    FechaRuta = FechaRuta + ', ' + Fecha.getDate() + ' de ';

                    if (Fecha.getMonth() == 0) {
                        FechaRuta = FechaRuta + "enero" + ' de ';
                    } else if (Fecha.getMonth() == 1) {
                        FechaRuta = FechaRuta + "febrero" + ' de ';
                    } else if (Fecha.getMonth() == 2) {
                        FechaRuta = FechaRuta + "marzo" + ' de ';
                    } else if (Fecha.getMonth() == 3) {
                        FechaRuta = FechaRuta + "abril" + ' de ';
                    } else if (Fecha.getMonth() == 4) {
                        FechaRuta = FechaRuta + "mayo" + ' de ';
                    } else if (Fecha.getMonth() == 5) {
                        FechaRuta = FechaRuta + "junio" + ' de ';
                    } else if (Fecha.getMonth() == 6) {
                        FechaRuta = FechaRuta + "julio" + ' de ';
                    } else if (Fecha.getMonth() == 7) {
                        FechaRuta = FechaRuta + "agosto" + ' de ';
                    } else if (Fecha.getMonth() == 8) {
                        FechaRuta = FechaRuta + "septiembre" + ' de ';
                    } else if (Fecha.getDay() == 9) {
                        FechaRuta = FechaRuta + "octubre" + ' de ';
                    } else if (Fecha.getDay() == 10) {
                        FechaRuta = FechaRuta + "noviembre" + ' de ';
                    } else if (Fecha.getDay() == 11) {
                        FechaRuta = FechaRuta + "diciembre" + ' de ';
                    }
                    console.log(FechaRuta);
                    FechaRuta = FechaRuta + Fecha.getFullYear();
                    html = html + `
                                <p>
                                    <img src="fotos/usuarios/${e.foto_usuario}" alt="usuario 1" width="65" height="90"> <br>
                                    ${e.usuario}
                                </p>
                                <a>${e.titulo}</a>`;

                    for (i = 0; i < parseInt(num, 10); i++) {
                        // dibuja lasestrellas llenas
                        html = html + `<i class="icon-star-1"></i>`;
                    }
                    if (bolmedia == false) {
                        if (parseInt(num, 10) < 5) {
                            for (j = parseInt(num, 10); j < 5; j++) {
                                // dibuja lasestrellas vacias
                                html = html + `<i class="icon-star-empty-1"></i>`;
                            }
                        }
                    } else {
                        // dibuja la mitad de estrella
                        html = html + `<i class="icon-star-half-alt"></i>`;
                        for (k = parseInt(num, 10) + 1; k < 5; k++) {
                            // dibuja las estrellas vacias
                            html = html + `<i class="icon-star-empty-1"></i>`;
                        }
                    }

                    html = html + `<br>
                                ${e.texto}
                                <p><time datetime="2022-02-20">${FechaRuta}</time></p>
                                `;
                    FechaRuta = '';
                });

                div.innerHTML = html;
                document.body.appendChild(div);


            });
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
    return false;
}

//comentarios
function comentario_no_logueado() {
    var div = document.getElementById("comen_no_logueado");
    let html = '';

    if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
        document.querySelector('#form-lugar').remove();
        html = html + `
                        <h3>Para poder dejar una valoración debes estar logueado</h3>
                        <a class="hover_enlace" href="login.html">Ir a login</a>
                        `;
        div.innerHTML = html;
        document.body.appendChild(div);
    } else {
        document.querySelector('#comen_no_logueado').remove();
        console.log("helou");
        Formu();
    }

}

function Formu() {

    let url = 'formulario.html';
    var div = document.getElementById("form-lugar");

    fetch(url).then(function (response) {
        if (response.ok) {
            console.log(response + "entro en formu");
            response.text().then(function (datos) {
                console.log(datos);
                div.innerHTML = datos;
            })
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
    return false;

}

function GuardarComentario(frm) {

    var URLactual = window.location;
    var id = URLactual.href.split("?")[1];

    if (!sessionStorage['pcw'] && !localStorage['pcw']) {
        return;
    } else if (localStorage['pcw']) {
        usu = JSON.parse(localStorage['pcw']);
    } else {
        usu = JSON.parse(sessionStorage['pcw']);
    }
    valor = usu.LOGIN + ':' + usu.TOKEN;

    let url = 'api/lugares/' + id + '/valoracion';
    let fd2 = new FormData(frm);
    let init = { method: 'POST', headers: { "Authorization": valor }, body: fd2 };

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log("entro en guardar comentario");
                console.log(datos);
                ComentarioCorrecto();
                // PedirRutasRutasFotos(uwu2);
            });
        }
    });
    return false;
}

function ComentarioCorrecto() {
    let div = document.createElement('div');
    let html;
    div.id = 'msj-modal';
    html = `<article>
                <h2>Comentario guardado correctamente</h2>
                <p>Ya puedes revisarlo junto con los demas comentarios.</p>
                <button onclick="BotonComentario()">Cerrar</button>
            </article>`;
    div.innerHTML = html;
    document.body.appendChild(div);
}

function BotonComentario() {

    document.querySelector('#msj-modal').remove();
    document.getElementById("form-lugar3").reset();
    CargarValoraciones();
    InfoLugarRecarga();
}

// if (window.location.toString().includes("lugar.html")) {
//     setInterval(
//         function () {

//         }, 1000);
//     }

 //para que solo se actualice la info del lugar
function InfoLugarRecarga() {

    var URLactual = window.location;
    var id = URLactual.href.split("?")[1];
    console.log("entro en infolugarrecgarga");
    let html = '';
    let html2 = '';
    let url = 'api/lugares/' + id;
    let init = { method: 'GET' };
    let div = document.getElementById('info_lugar');
    let div2 = document.getElementById('foto_lugar');

    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                var bolmedia = false;
                var media;
                var num;
                // sessionStorage['ids'] = datos.FILAS[0].id;
                /*let ul = document.createElement('ul');*/
                datos.FILAS.forEach(function (e, idx, v) {
                    // pillo el numero de valoracion y si tiene en su nombre la palabra media(para dibujar la media estrella)
                    if (e.valoracion_media.split(" ").length > 1) {
                        console.log("entro en el if");
                        media = e.valoracion_media.split(" ")[2];
                        console.log(media + "entro en infolugares");
                        bolmedia = true;
                    } else {
                        num = e.valoracion_media.split(" ")[0];
                        console.log(num + "entro en infolugares else");
                        bolnum = true;
                    }

                    html = html + `<a>Nombre:</a><a> ${e.nombre}</a> <br>
                                    <a>Dirección:</a><a> ${e.direccion}</a> <br>
                                    <a>Población:</a><a> ${e.poblacion}</a> <br>
                                    <a>Provincia:</a><a> ${e.provincia}</a> <br>
                                    <a>Valoración:</a>`;
                    // proceso para dibujar las estrellas segun la valoracion
                    for (i = 0; i < parseInt(num, 10); i++) {
                        // dibuja lasestrellas llenas
                        html = html + `<i class="icon-star-1"></i>`;
                    }
                    if (bolmedia == false) {
                        if (parseInt(num, 10) < 5) {
                            for (j = parseInt(num, 10); j < 5; j++) {
                                // dibuja lasestrellas vacias
                                html = html + `<i class="icon-star-empty-1"></i>`;
                            }
                        }
                    } else {
                        // dibuja la mitad de estrella
                        html = html + `<i class="icon-star-half-alt"></i>`;
                        for (k = parseInt(num, 10) + 1; k < 5; k++) {
                            // dibuja las estrellas vacias
                            html = html + `<i class="icon-star-empty-1"></i>`;
                        }
                    }
                    html = html + `<a class="hover_enlace" href="#salto_comentario"> ${e.nvaloraciones} valoraciones</a>
                                    <p>Comentario: ${e.comentario}</p>
                                    <a>Etiquetas:</a>`;
                    for (z = 0; z < e.etiquetas.length; z++) {
                        // dibuja las estrellas vacias

                        html = html + `<a class="hover_enlace" href="buscar.html"> ${e.etiquetas[z]} | </a> `;
                    }
                });

                if (div != null) {
                    div.innerHTML = html;
                    div.appendChild;
                    // document.body.appendChild(div);
                }
            });
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
    return false;
}

// BUSCAR
function hacerBusqueda() {
    console.log("hola");
    var div = document.getElementById('disposicion_buscar');
    var div2 = document.getElementById('h2_buscar');
    var url = 'api/lugares?';
    var nombre = document.getElementById("nombre").value;
    var poblacion = document.getElementById("poblacion").value;
    var etiqueta = document.getElementById("etiqueta").value;
    var min = document.getElementById("min").value;
    var max = document.getElementById("max").value;
    var html = '';
    var html2 = '';

    let init = { method: 'GET' };

    if (nombre!=null){
        url = url + `n=${nombre}`;
    }
    if (poblacion!=null){
        url = url + `&`;
        url = url + `pb=${poblacion}`;
    }
    if (etiqueta != null || !(etiqueta.isEmpty())) {
        url = url + `&`;
        url = url + `e=${etiqueta}`;
    }
    if (min != null) {
        url = url + `&`;
        url = url + `vd=${min}`;
    }
    if (max != null) {
        url = url + `&`;
        url = url + `vh=${max}`;
    }
    console.log(url);
    fetch(url, init).then(function (response) {
        if (response.ok) {
            response.json().then(function (datos) {
                console.log(datos);
                var bolmedia = false;
                var media;
                var num;
                var cont = 0;

                html2 = html2 + `Resultado de búsqueda`;

                datos.FILAS.forEach(function (e, idx, v) {
                    if (e.valoracion_media.split(" ").length > 1) {

                        media = e.valoracion_media.split(" ")[2];
                        console.log(media);
                        bolmedia = true;
                    } else {
                        num = e.valoracion_media.split(" ")[0];
                        console.log(num);
                        bolnum = true;
                    }

                    html = html + `<article>
                                        <a class="txt" href="lugar.html?${e.id}">
                                            <h4>${e.nombre}</h4>
                                        </a>
                                        <a class="contenedor" href="lugar.html?${e.id}">
                                            <img class="imagen" src="fotos/lugares/${e.imagen}" alt="imagen 1" width="470" height="320">
                                        </a>

                                        <div class="valoracion_index">
                                            <div class="p_valoracion">`;
                    // proceso para dibujar las estrellas segun la valoracion
                    for (i = 0; i < parseInt(num, 10); i++) {
                        // dibuja lasestrellas llenas
                        html = html + `<i class="icon-star-1"></i>`;
                    }
                    if (bolmedia == false) {
                        if (parseInt(num, 10) < 5) {
                            for (j = parseInt(num, 10); j < 5; j++) {
                                // dibuja lasestrellas vacias
                                html = html + `<i class="icon-star-empty-1"></i>`;
                            }
                        }
                    } else {
                        // dibuja la mitad de estrella
                        html = html + `<i class="icon-star-half-alt"></i>`;
                        for (k = parseInt(num, 10) + 1; k < 5; k++) {
                            // dibuja las estrellas vacias
                            html = html + `<i class="icon-star-empty-1"></i>`;
                        }
                    }
                    html = html + `<a class="hover_enlace" href="lugar.html"> ${e.nvaloraciones}</a>
                                            </div>
                                            <p class="tooltip"> ${e.poblacion}(${e.provincia})
                                                <span class="tooltiptext">${e.poblacion}(${e.provincia})</span>
                                            </p>
                                        </div>
                                    </article>`;
                });
                if (div != null) {
                    div2.innerHTML = html2;
                    div2.appendChild;
                    div.innerHTML = html;
                    div.appendChild;
                    // document.body.appendChild(div);
                }
            });
        } else {
            console.log('Error' + response.status + ':' + response.statusText);
        }
    });
    return false;
}



// NUEVO
function Add_foto() {
    let html = '';
    if(cont_fotos==0){
        let html2 = '';
        cont_fotos = cont_fotos +1;
    }
    let div = document.getElementById('interfaz_foto');

    html = html + `<div class="image-upload">
                        <label for="foto">
                            <img class="input_registro" src="fotos/usuarios/sin_imagen.jpg" alt="img" width="350" height="220">
                        </label>
                        <input id="foto" type="file">
                    </div>
                    <label class="boton_borrar4" for="foto">Añadir foto
                    </label>
                    <input class="boton_borrar4" name="foto" id="foto" type="file" required>
                    <input class="boton_borrar5" type="reset" value="Borrar foto"><br>
                `;
html = html + html2;
    html2 = html;

    if (div != null) {
        div.innerHTML = html;
        div.appendChild;
        // document.body.appendChild(div);
    }

}

function Menu() {
    var nuevo = document.getElementById('nuevo');
    var logout = document.getElementById('logout');
    var login = document.getElementById('login');
    var registro = document.getElementById('registro');
    var usu;

    if (window.location.toString().includes("index.html")) {
        if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
            nuevo.remove();
            logout.remove();
        } else {
            login.remove();
            registro.remove();

            if (localStorage['pcw']) {
                usu = JSON.parse(localStorage['pcw']);
            } else {
                usu = JSON.parse(sessionStorage['pcw']);
            }
            var usu_name = document.getElementById("name_usu");
            usu_name.innerText = usu.LOGIN;
        }
    }

    if (window.location.toString().includes("acerca.html")) {
        if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
            nuevo.remove();
            logout.remove();
        } else {
            login.remove();
            registro.remove();
            if (localStorage['pcw']) {
                usu = JSON.parse(localStorage['pcw']);
            } else {
                usu = JSON.parse(sessionStorage['pcw']);
            }
            var usu_name = document.getElementById("name_usu");
            usu_name.innerText = usu.LOGIN;
            // a = JSON.parse(sessionStorage['pcw']);

            // var usu_im = document.getElementById("im_usu");

            // usu_im.setAttribute("src", "https://localhost/pcw/practica2/fotos/usuarios/" + a.foto);

            // var usu_name = document.getElementById("name_usu");

            // usu_name.innerText = a.nombre;
        }
    }

    if (window.location.toString().includes("buscar.html")) {
        if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
            nuevo.remove();
            logout.remove();
        } else {
            login.remove();
            registro.remove();
            var URLactual = window.location;
            var lol = URLactual.href.split("?")[1];

            if (localStorage['pcw']) {
                usu = JSON.parse(localStorage['pcw']);
            } else {
                usu = JSON.parse(sessionStorage['pcw']);
            }
            var usu_name = document.getElementById("name_usu");
            usu_name.innerText = usu.LOGIN;

            var et = document.getElementById("etiqueta");
            if (lol!=null){
                et.value = lol;
            }
            // a = JSON.parse(sessionStorage['pcw']);

            // var usu_im = document.getElementById("im_usu");

            // usu_im.setAttribute("src", "https://localhost/pcw/practica2/fotos/usuarios/" + a.foto);

            // var usu_name = document.getElementById("name_usu");

            // usu_name.innerText = a.nombre;
        }
    }

    if (window.location.toString().includes("login.html")) {
        if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
            nuevo.remove();
            logout.remove();
        } else {
            login.remove();
            registro.remove();
            if (localStorage['pcw']) {
                usu = JSON.parse(localStorage['pcw']);
            } else {
                usu = JSON.parse(sessionStorage['pcw']);
            }
            var usu_name = document.getElementById("name_usu");
            usu_name.innerText = usu.LOGIN;
            window.location.replace("index.html");

            // a = JSON.parse(sessionStorage['pcw']);

            // var usu_im = document.getElementById("im_usu");

            // usu_im.setAttribute("src", "https://localhost/pcw/practica2/fotos/usuarios/" + a.foto);

            // var usu_name = document.getElementById("name_usu");

            // usu_name.innerText = a.nombre;
        }
    }

    if (window.location.toString().includes("lugar.html?")) {
        if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
            nuevo.remove();
            logout.remove();
        } else {
            login.remove();
            registro.remove();
            if (localStorage['pcw']) {
                usu = JSON.parse(localStorage['pcw']);
            } else {
                usu = JSON.parse(sessionStorage['pcw']);
            }
            var usu_name = document.getElementById("name_usu");
            usu_name.innerText = usu.LOGIN;
            // a = JSON.parse(sessionStorage['pcw']);

            // var usu_im = document.getElementById("im_usu");

            // usu_im.setAttribute("src", "https://localhost/pcw/practica2/fotos/usuarios/" + a.foto);

            // var usu_name = document.getElementById("name_usu");

            // usu_name.innerText = a.nombre;
        }
    } else if (window.location.toString().includes("lugar.html")) {
        window.location.replace("index.html");
        var usu_name = document.getElementById("name_usu");
        usu_name.innerText = usu.LOGIN;
    }

    if (window.location.toString().includes("nuevo.html")) {
        if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
            nuevo.remove();
            logout.remove();
            window.location.replace("index.html");
        } else {
            login.remove();
            registro.remove();
            if (localStorage['pcw']) {
                usu = JSON.parse(localStorage['pcw']);
            } else {
                usu = JSON.parse(sessionStorage['pcw']);
            }
            var usu_name = document.getElementById("name_usu");
            usu_name.innerText = usu.LOGIN;
            // a = JSON.parse(sessionStorage['pcw']);

            // var usu_im = document.getElementById("im_usu");

            // usu_im.setAttribute("src", "https://localhost/pcw/practica2/fotos/usuarios/" + a.foto);

            // var usu_name = document.getElementById("name_usu");

            // usu_name.innerText = a.nombre;
        }
    }

    if (window.location.toString().includes("registro.html")) {
        if (sessionStorage.getItem("pcw") == null && localStorage.getItem("pcw") == null) {
            nuevo.remove();
            logout.remove();
        } else {
            login.remove();
            registro.remove();
            if (localStorage['pcw']) {
                usu = JSON.parse(localStorage['pcw']);
            } else {
                usu = JSON.parse(sessionStorage['pcw']);
            }
            var usu_name = document.getElementById("name_usu");
            usu_name.innerText = usu.LOGIN;
            window.location.replace("index.html");

            // a = JSON.parse(sessionStorage['pcw']);

            // var usu_im = document.getElementById("im_usu");

            // usu_im.setAttribute("src", "https://localhost/pcw/practica2/fotos/usuarios/" + a.foto);

            // var usu_name = document.getElementById("name_usu");

            // usu_name.innerText = a.nombre;
        }
    }

}
