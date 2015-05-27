var pathFileId = "Android/data/com.phonegap.helloworld/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";
var dataContent;
var articlesToDownload = [];


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
	$("#results").append('<div class="alert alert-info" role="alert">'+message+"</div>");

}

function fail(e) {
	setVisibleText("FileSystem Error");
	setVisibleText(e);
}

function getUrlContent(urlRequest){
	if(!isOnInternet){
		return false
	}
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

function loadStyle(){
	$("head").append($('<link rel="stylesheet" href="css/'+window.localStorage.getItem('configurationTheme')+'.css" type="text/css" media="screen" />'));
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
		window.localStorage.setItem('configurationLogo',"false");
	}
	window.localStorage.setItem('configurationMenuStyle',configuration.estiloMenu);
	window.localStorage.setItem('configurationFooter',configuration.footer);

	loadStyle();
	setupHeader(configuration.menuItems);
}

function setupHeader(menuItems){
	if(menuItems===undefined){
		var configuration=getFileContentFromUrlServer("home","json");
		configuration = JSON.parse(configuration);
		menuItems = configuration.menuItems;
	}

	var logo = window.localStorage.getItem('configurationLogo')!="false";
	var homeHtmlString = "";
	var menuHtmlString="";


		homeHtmlString+='<div id="logo">';
		if(logo!="false"){
			homeHtmlString+='<img src="'+logo+'"/>';
		} else {
			homeHtmlString+=window.localStorage.getItem('configurationSiteName');
		}
		homeHtmlString+='</div>';

		$.each(menuItems,function(index,value){

			homeHtmlString+='<a id="menu-activator" href="#sidr">Toggle menu</a>';

			menuHtmlString+='<div id="Mainmenu">';
				menuHtmlString+='<div class="menuItem" menu-name="'+value[0]+'" menu-type="'+value[2]+'">';
					menuHtmlString+=value[1];
				menuHtmlString+='</div>';
			menuHtmlString+='</div>';

			$("#sidr").html(menuHtmlString);
		});


	$('#menu-activator').sidr();
	$("#header").prepend(homeHtmlString);
}

function verifyDataContent(string){
	string = string.replace(/\t/g, '');
	return string;
}

function printArticle(articleData){
	articleData = verifyDataContent(articleData);
	var article = JSON.parse(articleData);
	var homeHtmlString = "";

	homeHtmlString+='<div class="articleContentSingle" content-id="'+article.ID+'">';
		homeHtmlString+="<h2>"+article.post_title+"</h2>";
		homeHtmlString+='<img src="'+article.featured_image+'"/>';
		homeHtmlString+="<p>"+article.post_content+"</p>";
	homeHtmlString+="</div>";

	$("#content").html(homeHtmlString);

}

function showArticle(articleID){
	dataContent=getFileContentFromUrlServer("article"+articleID,"json");
	if(dataContent==false){
		if(isOnInternet()){
			dataContent=getUrlContent(mobileUrl+"article.php?articleID="+articleID);
			if(dataContent!=false){
				saveFileToSystem("article"+articleID,"json",dataContent);
				printArticle(dataContent);
			}
		} else {
			generateAlert("Imposible Cargar Contenido","Este articulo no ha sido descargado, intente nuvemante cuando tenga conexión a Internet","Aceptar");
		}
	} else {
		printArticle(dataContent);
	}
}


function showMultipleContent(dataContent){
	setVisibleText("Se Mostrara el Home");

	if(dataContent===undefined){
		dataContent=getFileContentFromUrlServer("home","json")
	}

	setVisibleText("El datacontent se cargo");
	dataContent = verifyDataContent(dataContent);
	var home = JSON.parse(dataContent);
	var homeHtmlString="";
	for (var key in home) {
		if (home.hasOwnProperty(key)) {
			homeHtmlString+='<div class="catTypesContainer">';
			homeHtmlString+="<h1>"+key+"</h1>";
			home[key].forEach(function(article) {
				articlesToDownload.push(article.ID);
				homeHtmlString+='<div class="articleContentCategory" content-id="'+article.ID+'">';
					homeHtmlString+="<h2>"+article.post_title+"</h2>";
					homeHtmlString+='<img src="'+article.featured_image+'"/>';
					homeHtmlString+="<p>"+article.post_excerpt+"</p>";
				homeHtmlString+="</div>"
			});
			homeHtmlString+="</div>"

		}
	}
	$("#content").html(homeHtmlString);
	downloadArticles();
}

function downloadArticles(){
	$.each(articlesToDownload,function(index,value){
		setVisibleText("article to download, index: "+index+" , value: "+value);
		dataContent=getFileContentFromUrlServer("article"+value,"json");
		if(dataContent==false){
			dataContent=getUrlContent(mobileUrl+"article.php?articleID="+value);
			if(dataContent!=false){
				saveFileToSystem("article"+value,"json",dataContent);
			}
		}
	});
	articlesToDownload=[];
}

function onDeviceReady() {

	setVisibleText("Telefono Listo");

	if(isFirstTimeApp()){

		setFileUrlServer();


		if(isOnInternet){
			dataContent=getUrlContent(mobileUrl+"mconfig.php");

			if(dataContent!=false){
				saveFileToSystem("config","json",dataContent);
				var configuration = JSON.parse(dataContent);
				setConfigurationVariables(configuration);

				dataContent=getUrlContent(mobileUrl+"home.php");
				if(dataContent!=false){
					saveFileToSystem("home","json",dataContent);
					showMultipleContent(dataContent);
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

		loadStyle();
		setupHeader();
		if(isOnInternet){
			dataContent=getUrlContent(mobileUrl+"mconfig.php");
			showMultipleContent();
			//cargar config movil, cargar config de internet y comparar versiones
			//descargar nuevos si la version en linea es diferente
			//descargar archivos faltantes
		} else {
			showMultipleContent();
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
	setVisibleText("Obteniendo URL Directorio");
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

document.addEventListener('deviceready', onDeviceReady, false);

$( "body" ).delegate( ".articleContentCategory", "click", function() {
	showArticle($(this).attr("content-id"));
});