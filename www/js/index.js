document.addEventListener('deviceready', onDeviceReady, false);

var pathFileId = "Android/data/com.phonegap.helloworld/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";
var dfdObject = $.Deferred();


var fileTitle="";
var fileExtension="";
var fileContent="";

var loadTitle;
var loadExtension;

function isOnInternet(){
	if(navigator.connection.type=="Connection.NONE"){
		setVisibleText("No Esta en Internet");
		return false;
	} else {
		setVisibleText("Esta en Internet");
		return true;
	}
}

function setVisibleText(message){
	$("#error_js").html("");
	$("#results").append(message+"<br/>");
}

function fail(e) {
	setVisibleText("FileSystem Error");
	setVisibleText(e);
}

function getUrlContent(urlRequest){
	setVisibleText("Se hizo peticion al servidor " + urlRequest);
	var response = false;
	$.ajax({
		url: urlRequest,
        async: false,
		cache: false,
		success: function(data){
			response = data;
		},
		error: function() { 
			response = false;
		}
	});
	
	return response;
	
}

function isFirstTimeApp(){
	
	var firstTimeApp;

	if(window.localStorage.getItem('firstTimeApp') === undefined){
		window.localStorage.setItem('firstTimeApp',true);
		setVisibleText("Es la primera vez");
		return true;
	} else {
		firstTimeApp = window.localStorage.getItem('firstTimeApp');

		if(firstTimeApp){
			setVisibleText("No Es la primera vez");
			return false;
		} else {
			window.localStorage.setItem('firstTimeApp',true);
			setVisibleText("Es la primera vez");
			return true;
		}
	}
	
}

function generateAlert(title,message,button){
	setVisibleText("Se genero una alerta"+message);
	navigator.notification.alert(
		message,
		function() {
			navigator.app.exitApp();
		},
		title,
		button
	);
}



function onDeviceReady() {

	setVisibleText("Telefono Listo");

	if(isFirstTimeApp()){
		if(isOnInternet){
			//cargar home
			//cargar articulos mientras se muestra el home
			var dataContent=getUrlContent(mobileUrl+"mconfig.php");
			if(dataContent!=false){
				dfdObject.done(saveFileToSystem("config","json",dataContent)).done(loadFileFromSystem("config","json")).done(setVisibleText(loadFileContent));
				dfdObject.resolve();
			} else {
				setVisibleText("Imposible Conectar");
				window.localStorage.setItem('firstTimeApp',false);
				generateAlert("Imposible Conectar","No se puede conectar con nuestro servidor en este momento, intente más tarde","Aceptar");
			}

		} else {
			window.localStorage.setItem('firstTimeApp',false);
			generateAlert("Sin Conexión","Se requiere internet la primera vez que inicialice la aplicación","Aceptar");
			navigator.app.exitApp();

		}
	}else {
		if(isOnInternet){
			loadFileFromSystem("config","json");
			//cargar config movil, cargar config de internet y comparar versiones
			//descargar nuevos si la version en linea es diferente
			//descargar archivos faltantes
		} else {
			loadFileFromSystem("config","json");
		}
	}
}

function loadFileFromSystem(title,extension){
	loadTitle=title;
	loadExtension=extension;
	setVisibleText("Cargando Archivo");
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFRSuccess, fail);

}

	function onFRSuccess(fileSystem) {
		fileSystem.root.getFile(pathFileId+loadTitle+"."+loadExtension, {create:false, exclusive:false}, gotFileEntryToRead, fail);
	}

		function gotFileEntryToRead(fileEntry) {
			setVisibleText("Obteniendo Archivo");
			var dataContent=getUrlContent(fileEntry.toURL());
			setVisibleText("Archivo Cargado");
			setVisibleText(dataContent);
		}

function saveFileToSystem(title,extension,content) {
	setVisibleText("Guardando Archivo");
	fileContent=content;
	fileTitle=title;
	fileExtension=extension;

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, fail);
}
	function onFSSuccess(fileSystem) {
		fileSystem.root.getFile(pathFileId+fileTitle+"."+fileExtension, {create:true, exclusive:false}, gotFileEntry, fail);
	}
		function gotFileEntry(fileEntry) {
			fileEntry.createWriter(gotFileWriter, fail);
		}
			function gotFileWriter(writer) {
				writer.onwrite = function(evt) {
					setVisibleText("Archivo Escrito");
				};
				writer.write(fileContent);
			}