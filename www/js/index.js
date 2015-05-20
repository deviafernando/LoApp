document.addEventListener('deviceready', onDeviceReady, false);

var pathFileId = "Android/data/com.phonegap.helloworld/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";
var dfdObject = $.Deferred();

var fileContent;
var fileTitle;
var fileExtension;
var dataContent;

var loadExtension;
var loadTitle;

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

/*
function isVariableReady(variableToTest){

	intervalVar = setInterval(function(){
		if(variableToTest){
			//la variable esta lista
		}
	}, 100);

}
 */

function setConfigurationVariables(configuration){
	window.localStorage.setItem('configurationAppVersion',configuration.AppVersion);
	window.localStorage.setItem('configurationSiteName',configuration.siteName);
	window.localStorage.setItem('configurationTheme',configuration.theme);
	if(configuration.logo.imagen==1){
		window.localStorage.setItem('configurationLogo',configuration.logo.logoUrl);
	} else {
		window.localStorage.setItem('configurationLogo',false);
	}
	window.localStorage.setItem('configurationMenuStyle',configuration.estiloMenu);
	window.localStorage.setItem('configurationFooter',configuration.footer);
}

function onDeviceReady() {

	setVisibleText("Telefono Listo");

	if(isFirstTimeApp()){

		setFileUrlServer();

		if(isOnInternet){
			//cargar home
			//cargar articulos mientras se muestra el home
			dataContent=getUrlContent(mobileUrl+"mconfig.php");

			if(dataContent!=false){
				saveFileToSystem("config","json",dataContent);
				var configuration = JSON.parse(dataContent);
				setConfigurationVariables(configuration);

				dataContent=getUrlContent(mobileUrl+"home.php");
				if(dataContent!=false){
					saveFileToSystem("home","json",dataContent);
				} else {
					setVisibleText("Imposible Conectar");
					window.localStorage.setItem('firstTimeApp',false);
					generateAlert("Imposible Conectar","No se puede conectar con nuestro servidor en este momento, intente más tarde","Aceptar");
				}
				//dfdObject.done(saveFileToSystem("config","json",dataContent));
				//dfdObject.resolve();
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

			getFileContentFromUrlServer("config","json");
			//cargar config movil, cargar config de internet y comparar versiones
			//descargar nuevos si la version en linea es diferente
			//descargar archivos faltantes
		} else {
			getFileContentFromUrlServer("config","json");
		}
	}
}


function getFileContentFromUrlServer(title,extension){
	setVisibleText("Cargando archivo dentro del telefono");
	var returnFileContent;
	var urlToRequest=getFileUrlServer()+pathFileId+title+"."+extension;
	returnFileContent= getUrlContent(urlToRequest);
	setVisibleText(returnFileContent);
	return returnFileContent;
}

function getFileUrlServer(){
	setVisibleText("Obteniendo URL Directorio")
	return window.localStorage.getItem('directoryUrl');
}

function setFileUrlServer(){
	setVisibleText("Cargando Directorio");
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFRSuccess, fail);
}

function onFRSuccess(fileSystem) {
	setVisibleText("Guardando Variable Directorio");
	window.localStorage.setItem('directoryUrl',fileSystem.root.toURL());
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