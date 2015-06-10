$( document ).ready(function() {


var pathFileId = "Android/data/com.imagina.enibague/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";
var dataContent;
var articlesToDownload = [];
var menusToDownload = [];
var breadcrumbsNavigation = [];
var menuStatus=false;
var readyToExit=false;


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
	//$("#results").append('<div class="alert alert-info" role="alert">'+message+"</div>");

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

		setVisibleText("Es la primera vez");
		return true;
	} else {
		firstTimeApp = window.localStorage.getItem('firstTimeApp');

		if(firstTimeApp=="true"){
			setVisibleText("No Es la primera vez");
			return false;
		} else {
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

function setConfigurationVariables(configuration){
	window.localStorage.setItem('configurationAppVersion',configuration.appVersion);
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
		var configuration=getFileContentFromUrlServer("config","json");
		configuration = JSON.parse(configuration);
		menuItems = configuration.menuItems;
	}

	var logo = window.localStorage.getItem('configurationLogo');
	var homeHtmlString = "";
	var menuHtmlString="";

		homeHtmlString+='<a id="menu-activator" href="#sidr"></a>';

		homeHtmlString+='<div id="logo">';
		if(logo!="false"){
			homeHtmlString+='<img src="'+logo+'"/>';
		} else {
			homeHtmlString+=window.localStorage.getItem('configurationSiteName');
		}
		homeHtmlString+='</div>';


		menuHtmlString+='<div class="menuItemHome" menu-name="home" menu-type="home">';
			menuHtmlString+='HOME';
		menuHtmlString+='</div>';

		$.each(menuItems,function(index,value){

				menuHtmlString+='<div class="menuItem" menu-title="'+value[1]+'" menu-name="'+value[0]+'" menu-type="'+value[2]+'">';
				menusToDownload.push(value);
					menuHtmlString+=value[1];
				menuHtmlString+='</div>';


			$("#sidr").html(menuHtmlString);
		});


	$("#header").html(homeHtmlString);
	$("#content").css("margin-top",$("#header").height());

	$("#menu-activator").sidr({
		onOpen: function(){
			menuStatus=true;
		},
		onClose: function(){
			menuStatus=false;
		}
	});

	downloadMenus();

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
		homeHtmlString+='<img class="img-responsive img-thumbnail" src="'+article.featured_image+'"/>';
		homeHtmlString+="<p>"+article.post_content+"</p>";
		homeHtmlString+='<br class="clear"/>';
	homeHtmlString+="</div>";

	changeContent(homeHtmlString);

}

function showCategory(menuName,menuTitle,menuType){

	dataContent=getFileContentFromUrlServer(menuType+menuTitle,"json");
	if(dataContent==false){
		if(isOnInternet()){
			if(menuType=="type"){
				dataContent=getUrlContent(mobileUrl+"cat_type.php?type="+menuName+"&typeTitle="+menuTitle);
			} else if(menuType=="cat") {
				dataContent=getUrlContent(mobileUrl+"cat_type.php?category="+menuName+"&categoryTitle="+menuTitle);
			}

			if(dataContent!=false){
				saveFileToSystem(menuType+menuTitle,"json",dataContent);
				showMultipleContent(menuType+menuTitle,"json",dataContent);
			}
		} else {
			generateAlert("Imposible Cargar Contenido","Este articulo no ha sido descargado, intente nuvemante cuando tenga conexión a Internet","Aceptar");
		}
	} else {
		showMultipleContent(menuType+menuTitle,"json",dataContent);
	}
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


function showMultipleContent(fileName,Extension,dataContent){
	setVisibleText("Se Mostrara el Home");

	if(dataContent===undefined){
		dataContent=getFileContentFromUrlServer(fileName,Extension);
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
	changeContent(homeHtmlString);
	downloadArticles();
}

function changeContent(htmlString){

	$("#content").html(htmlString);
}

function downloadArticles(){
	$.each(articlesToDownload,function(index,value){
		setVisibleText("article to download, index: "+index+" , value: "+value);
		dataContent=getFileContentFromUrlServer("article"+value,"json");
		var downloadAgain = window.localStorage.getItem("versionDownloadAgain");
		if(dataContent==false || downloadAgain=="true"){
			dataContent=getUrlContent(mobileUrl+"article.php?articleID="+value);
			if(dataContent!=false){
				saveFileToSystem("article"+value,"json",dataContent);
			}
		}
	});
	articlesToDownload=[];
}

function downloadMenus(){

	$.each(menusToDownload,function(index,value){
		setVisibleText("article to download, index: "+index+" , value: "+value[1]);

		dataContent=getFileContentFromUrlServer(value[2]+value[1],"json");

		var downloadAgain = window.localStorage.getItem("versionDownloadAgain");
		if(dataContent==false || downloadAgain=="true"){

			if(value[2]=="type"){
				dataContent=getUrlContent(mobileUrl+"cat_type.php?type="+value[0]+"&typeTitle="+value[1]);
			} else if(value[2]=="cat") {
				dataContent=getUrlContent(mobileUrl+"cat_type.php?category="+value[0]+"&categoryTitle="+value[1]);
			}

			if(dataContent!=false){
				saveFileToSystem(value[2]+value[1],"json",dataContent);
			}
		}
	});
	menusToDownload=[];
	window.localStorage.setItem("versionDownloadAgain","false");

}

function hideSplashScreen(){
	setTimeout(function(){
		$("#splashScreen").css("display","none");
	}, 5000);
}

function onDeviceReady() {

	setVisibleText("Telefono Listo");

	if(isFirstTimeApp()){

		setFileUrlServer();
		window.localStorage.setItem("versionDownloadAgain","false");

		if(isOnInternet){
			dataContent=getUrlContent(mobileUrl+"mconfig.php");

			if(dataContent!=false){
				saveFileToSystem("config","json",dataContent);
				var configuration = JSON.parse(dataContent);
				setConfigurationVariables(configuration);

				dataContent=getUrlContent(mobileUrl+"home.php");
				hideSplashScreen();
				if(dataContent!=false){
					saveFileToSystem("home","json",dataContent);
					showMultipleContent("home","json",dataContent);
					window.localStorage.setItem('firstTimeApp',true);
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
			hideSplashScreen();
			window.localStorage.setItem('firstTimeApp',false);
			generateAlert("Sin Conexión","Se requiere internet la primera vez que inicialice la aplicación","Aceptar");
			navigator.app.exitApp();

		}
	}else {

		loadStyle();
		setupHeader();
		hideSplashScreen();

		if(isOnInternet){
			showMultipleContent("home","json");

			var dataContent=getUrlContent(mobileUrl+"mconfig.php");
			if(dataContent!=false){
				var configuration = JSON.parse(dataContent);
				var downloadAgain = window.localStorage.getItem("versionDownloadAgain");
				if((configuration.appVersion.toString()!=window.localStorage.getItem('configurationAppVersion')) || (window.localStorage.getItem("versionDownloadAgain")=="true")){
					window.localStorage.setItem("versionDownloadAgain","true");
					dataContent=getUrlContent(mobileUrl+"home.php");
					if(dataContent!=false){
						saveFileToSystem("home","json",dataContent);
						showMultipleContent("home","json",dataContent);
						setConfigurationVariables(configuration);
					}
				}

			}
		} else {
			showMultipleContent("home","json");
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
	setVisibleText("se hizo click en el articulo "+$(this).attr("content-id"));
	breadcrumbsNavigation.push([$(this).attr("content-id"),"article"]);

	showArticle($(this).attr("content-id"));
});

$( "body" ).delegate( ".menuItemHome", "click", function() {


	$(".activeMenuItem").removeClass("activeMenuItem");
	$(this).addClass("activeMenuItem");

	breadcrumbsNavigation = [];
	showMultipleContent("home","json");
});


$( "body" ).delegate( ".menuItem,.menuItemActive", "click", function() {

	$(".activeMenuItem").removeClass("activeMenuItem");
	$(this).addClass("activeMenuItem");

	breadcrumbsNavigation.push([$(this).attr("menu-type")+$(this).attr("menu-title"),"cat_type"]);
	showCategory($(this).attr("menu-name"),$(this).attr("menu-title"),$(this).attr("menu-type"));

});

function showToast(message,duration){
	$("#toast").html(message);
	$("#toast").fadeToggle( (duration/2), function() {
		$("#toast").fadeToggle( (duration/2), function() {

		});
	});
}

document.addEventListener("backbutton", function(){

	setVisibleText(breadcrumbsNavigation.length);

	if(breadcrumbsNavigation.length == 0 && menuStatus==false){
		if(readyToExit) {
			navigator.app.exitApp();
		}

		readyToExit=true;

		showToast("Presione nuevamente atras para salir",4000);

		setTimeout(function(){
			readyToExit=false;
		}, 4000);

	} else {
		if(menuStatus){
			$.sidr('close', 'sidr');
			setVisibleText("cerrar panel izquierdo");
		} else {
			breadcrumbsNavigation.pop();

			if(breadcrumbsNavigation.length == 0){
				setVisibleText("de vuelta al home");
				showMultipleContent("home","json");
			} else {

				var lastPage = breadcrumbsNavigation[breadcrumbsNavigation.length-1];
				setVisibleText("vamos a lastpage "+lastPage[0]);
				if(lastPage[1]=="article"){
					showArticle(lastPage[0],"json")
				} else {
					showMultipleContent(lastPage[0],"json")
				};
				//[["cat1213","category_type"],["Article123","article"]]
			}
		}
	}
}, false);


});