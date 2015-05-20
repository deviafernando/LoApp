document.addEventListener('deviceready', onDeviceReady, false);

var pathFileId = "Android/data/com.phonegap.helloworld/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";
var dataContent;

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

function showHome(dataContent){
	setVisibleText("Se Mostrara el Home");

	if(dataContent===undefined){
		dataContent=getFileContentFromUrlServer("home","json")
	}

	setVisibleText("El datacontent se cargo");

	

	var home = JSON.parse(dataContent);
	var homeHtmlString="";
	for (var key in home) {
		if (home.hasOwnProperty(key)) {
			homeHtmlString+="<div>";
			homeHtmlString+="<h1>"+key+"</h1>"; //este sera el titulo de la categoria
			home[key].forEach(function(article) {
				homeHtmlString+="<h2>"+article.post_title+"</h2>";
				homeHtmlString+="<p>"+article.post_excerpt+"</p>";
			});
			homeHtmlString+="</div>"

		}
	}

	$("#content").html(homeHtmlString);
}

function onDeviceReady() {

	setVisibleText("Telefono Listo");

	if(isFirstTimeApp()){

		setFileUrlServer();

		if(isOnInternet){

			//cargar articulos mientras se muestra el home
			dataContent=getUrlContent(mobileUrl+"mconfig.php");

			if(dataContent!=false){
				saveFileToSystem("config","json",dataContent);
				var configuration = JSON.parse(dataContent);
				setConfigurationVariables(configuration);

				dataContent=getUrlContent(mobileUrl+"home.php");
				if(dataContent!=false){
					saveFileToSystem("home","json",dataContent);
					showHome(dataContent);
				} else {
					setVisibleText("Imposible Conectar");
					window.localStorage.setItem('firstTimeApp',false);
					generateAlert("Imposible Conectar","No se puede conectar con nuestro servidor en este momento, intente más tarde","Aceptar");
				}

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
			dataContent=getUrlContent(mobileUrl+"mconfig.php");
			showHome();
			//cargar config movil, cargar config de internet y comparar versiones
			//descargar nuevos si la version en linea es diferente
			//descargar archivos faltantes
		} else {
			showHome();
		}
	}
}


function getFileContentFromUrlServer(title,extension){
	setVisibleText("Cargando archivo dentro del telefono");
	var returnFileContent;
	var urlToRequest=getFileUrlServer()+pathFileId+title+"."+extension;
	returnFileContent= getUrlContent(urlToRequest);
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

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		onFSSuccess(fileSystem,content,title,extension);
	}, fail);
}
	function onFSSuccess(fileSystem,content,title,extension) {
		fileSystem.root.getFile(pathFileId+title+"."+extension, {create:true, exclusive:false}, function(fileEntry){
			gotFileEntry(fileEntry,content);
		}, fail);
	}
		function gotFileEntry(fileEntry,content) {
			fileEntry.createWriter(function(writer){
				gotFileWriter(writer,content);
			}, fail);
		}
			function gotFileWriter(writer,content) {
				writer.onwrite = function(evt) {
					setVisibleText("Archivo Escrito");
				};
				writer.write(content);
			}