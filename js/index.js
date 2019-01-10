/*
  Creación de una función personalizada para jQuery que detecta cuando se detiene el scroll en la página
*/

$.fn.scrollEnd = function(callback, timeout) {
  $(this).scroll(function(){
    var $this = $(this);
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    $this.data('scrollTimeout', setTimeout(callback,timeout));
  });
};

/*
  Función que inicializa el elemento Slider
*/

function inicializarSlider(){
  $("#rangoPrecio").ionRangeSlider({
    type: "double",
    grid: false,
    min: 0,
    max: 100000,
    from: 200,
    to: 80000,
    prefix: "$"
  });
}
/*
  Función que reproduce el video de fondo al hacer scroll, y deteiene la reproducción al detener el scroll
*/
function playVideoOnScroll(){
  var ultimoScroll = 0,
      intervalRewind;
  var video = document.getElementById('vidFondo');
  $(window)
    .scroll((event)=>{
      var scrollActual = $(window).scrollTop();
      if (scrollActual > ultimoScroll){
       video.play();
     } else {
        //this.rewind(1.0, video, intervalRewind);
        video.play();
     }
     ultimoScroll = scrollActual;
    })
    .scrollEnd(()=>{
      video.pause();
    }, 10)
}

inicializarSlider();
playVideoOnScroll();


$(()=>{
  //Llenar filtros.
  obtenerInfoFiltros();

  //seleccionar "Mostrar Todos"
  $('#mostrarTodos').on("click",()=>{
    obtenerInfoAnuncios("todo");
    $('#selectCiudad').val("");
    $('#selectTipo').val("");

  });

  //seleccionar "Buscar"
  $('#formulario').submit((event)=>{
    event.preventDefault();
    obtenerInfoAnuncios("filtrado");
  });

  $('#selectCiudad').addClass("browser-default");
  $('#selectTipo').addClass("browser-default");

});

//llamado al seleccionar "Mostrar Todos" o "Buscar"
function obtenerInfoFiltros(){
   $.ajax({
     url: "obtenerInfo.php",
     dataType: "json",
     cache: false,
     contentType: false,
     processData: false,
     type: 'post',
     success: response => {
       //funcion que carga valores a los filtros.
       cargarFiltros(response);
     },
     error: () => {
       window.location.href = 'index.html';
     }
   })
};

//funcion que carga valores a los filtros.
function cargarFiltros(respuesta){
  //Creo nuevos arreglos
  let ciudades = new Array;
  let tipoProp = new Array;

  for (let i = 0; i < respuesta.length; i++) {
    ciudades.push(respuesta[i].Ciudad);
    tipoProp.push(respuesta[i].Tipo);
  }

  //funcion que valida si el valor ya existe
  const distintos = (value, index, self) => {
    return self.indexOf(value) === index
  };

  //Creo nuevos arreglos ya filtrados
  const ciudadesDistintas = ciudades.filter(distintos);
  const tipoPropDistintas = tipoProp.filter(distintos);

  //cargar informacion en Combo Ciudad
  for (let i = 0; i < ciudadesDistintas.length; i++) {
    let newOption = '<option value="'+ciudadesDistintas[i]+'">'+ciudadesDistintas[i]+'</option>';
    $('#selectCiudad').append(newOption);
  }
  //cargar informacion en Combo Tipo
  for (let i = 0; i < tipoPropDistintas.length; i++) {
    let newOption = '<option value="'+tipoPropDistintas[i]+'">'+tipoPropDistintas[i]+'</option>';
    $('#selectTipo').append(newOption);
  }

}

//llamado al seleccionar "Mostrar Todos" o "Buscar"
function obtenerInfoAnuncios(tipoBusqueda){
   $.ajax({
     url: "obtenerInfo.php",
     dataType: "json",
     cache: false,
     contentType: false,
     processData: false,
     type: 'post',
     success: response => {
       //funcion que carga los anuncios en pantalla
       creaAnuncio(response,tipoBusqueda);
     },
     error: () => {
       window.location.href = 'index.html';
     }
   })
};

//funcion que carga los anuncios en pantalla
function creaAnuncio(respuesta,tipoBusqueda){
  const fCiudad = $('#selectCiudad').val();
  const fTipo = $('#selectTipo').val();
  const fDesde = $("#rangoPrecio").data().from;
  const fHasta = $("#rangoPrecio").data().to;
  let validoCiudad = false;
  let validoTipo = false;

  if(fCiudad != ""){
    validoCiudad = true;
  }
  if(fTipo != ""){
    validoTipo = true;
  }

  $('.colContenido .row').remove();

  for (let i = 0; i < respuesta.length; i++) {
    const newRow = '<div class="row">'+
       '<div class="card z-depth-2">'+
         '<div class="col s12 m5 l5">'+
           '<div class="card-image">'+
             '<img src="img/home.jpg" class="responsive-img">'+
           '</div>'+
         '</div>'+
         '<div class="col s12 m7 l7">'+
           '<div class="card-content">'+
             '<ul>'+
                '<li><b>Dirección: </b>'+respuesta[i].Direccion+'</li>'+
                '<li><b>Ciudad: </b>'+respuesta[i].Ciudad+'</li>'+
                '<li><b>Teléfono: </b>'+respuesta[i].Telefono+'</li>'+
                '<li><b>Codig Postal: </b>'+respuesta[i].Codigo_Postal+'</li>'+
                '<li><b>Tipo: </b>'+respuesta[i].Tipo+'</li>'+
                '<li><b>Precio: </b><span class="precioTexto">'+respuesta[i].Precio+'</span></li>'+
             '</ul>'+
           '</div>'+
           '<div class="card-action">'+
             '<a href="#">VER MAS...</a>'+
           '</div>'+
         '</div>'+
       '</div>'+
     '</div>';

     if(tipoBusqueda == "todo"){
       $('.colContenido').append(newRow);
     }else {
       let intPrecio = respuesta[i].Precio.replace("$","").replace(",","");

       if((intPrecio >= fDesde && intPrecio <= fHasta) && ((validoCiudad == true && respuesta[i].Ciudad == fCiudad) || validoCiudad == false) && ((validoTipo == true && respuesta[i].Tipo == fTipo) || validoTipo == false)){
         $('.colContenido').append(newRow);
       }
     }

   }

};
