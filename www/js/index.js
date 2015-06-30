$( document ).ready(function() {

var pathFileId = "Android/data/com.imagina.enibague/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";
var articlesToDownload = [];
var menusToDownload = [];
var breadcrumbsNavigation = [];
var menuStatus=false;
var readyToExit=false;
var contentLoadingTimeOut;
var pushNotification;

function setUpNotifications() {

	try
	{
		pushNotification = window.plugins.pushNotification;

		if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos' ) {
			pushNotification.register(successHandler, errorHandler, {"senderID":"583978535652","ecb":"onNotification"});
		} else {
			pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});
		}
	}
	catch(err)
	{
		txt="There was an error on this page.\n\n";
		txt+="Error description: " + err.message + "\n\n";
		setVisibleText(txt);
	}
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
	if (e.alert) {
		navigator.notification.alert(e.alert);
	}

	if (e.sound) {
		var snd = new Media(e.sound);
		snd.play();
	}

	if (e.badge) {
		pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
	}
}

// handle GCM notifications for Android
function onNotification(e) {
	setVisibleText('<li>EVENT -> RECEIVED:' + e.event + '</li>');

	switch( e.event )
	{
		case 'registered':
			if ( e.regid.length > 0 )
			{
				setVisibleText('<li>REGISTERED -> REGID:' + e.regid + "</li>");
				console.log("regID = " + e.regid);
				//TODO e.regid to send and save
			}
			break;

		case 'message':
			if (e.foreground)
			{
				setVisibleText('<li>--INLINE NOTIFICATION--' + '</li>');
				var soundfile = e.soundname || e.payload.sound;
				var my_media = new Media("/android_asset/www/"+ soundfile);

				my_media.play();
			}
			else
			{
				if (e.coldstart)
					setVisibleText('<li>--COLDSTART NOTIFICATION--' + '</li>');
				else
					setVisibleText('<li>--BACKGROUND NOTIFICATION--' + '</li>');
			}

			setVisibleText('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
			//android only
			setVisibleText('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
			//amazon-fireos only
			setVisibleText('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');
			break;

		case 'error':
			setVisibleText('<li>ERROR -> MSG:' + e.msg + '</li>');
			break;

		default:
			setVisibleText('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
			break;
	}
}

function tokenHandler (result) {
	setVisibleText('<li>token: '+ result +'</li>');
	// Your iOS push server needs to know the token before it can push to this device
	// here is where you might want to send it the token for later use.
}

function successHandler (result) {
	setVisibleText('<li>success:'+ result +'</li>');
}

function errorHandler (error) {
	setVisibleText('<li>error:'+ error +'</li>');
}








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
	return true;
}

function fail(e) {
	setVisibleText("FileSystem Error");
	setVisibleText(e);
	return true;
}

function firstTimeHome(data){
	hideSplashScreen();
	saveFileToSystem("home","json",data);
	showMultipleContent("home","json",data);
	window.localStorage.setItem('firstTimeApp',true);
}

function firstTimeConfiguration(data){
	saveFileToSystem("config","json",data);
	var configuration = JSON.parse(data);

	if(isFirstTimeApp()) {
		window.localStorage.setItem('configurationAppVersionLast',configuration.appVersion);
	}

	setConfigurationVariables(configuration);
	requestUrlContent(mobileUrl+"home.php","FirstTimeHome",true);
}

function setUpMenuItems(data){
	var configuration = JSON.parse(data);
	setupHeader(configuration.menuItems);
}

function compareConfiguration(data){
	var configuration = JSON.parse(data);
	if(configuration.appVersion.toString()!=window.localStorage.getItem('configurationAppVersion')){
		window.localStorage.setItem("versionDownloadAgain","true");
		window.localStorage.setItem('configurationAppVersionLast',configuration.appVersion);
		requestUrlContent(mobileUrl+"home.php","FirstTimeHome",false);
		setConfigurationVariables(configuration);
	}
}

function menuContentDownload(fileExist,value){
	var downloadAgain = window.localStorage.getItem("versionDownloadAgain");

	if(!fileExist || downloadAgain=="true"){
		if(value[2]=="type"){
			requestUrlContent(mobileUrl+"cat_type.php?type="+value[0]+"&typeTitle="+value[1],"CatTypeDownload",false,value);
		} else if(value[2]=="cat") {
			requestUrlContent(mobileUrl+"cat_type.php?category="+value[0]+"&categoryTitle="+value[1],"CatTypeDownload",false,value);
		}
	}
}

function catTypeDownload(data,value){
	saveFileToSystem(value[2]+value[1],"json",data);
}

function catTypeShow(data,value){
	showMultipleContent(value[2]+value[1],"json",data);
}

function articleDownload(data,articleID){
	saveFileToSystem("article"+articleID,"json",data);
}

function downloadAgain(data,articleID){
	saveFileToSystem("article"+articleID,"json",data);
	printArticle(data);
}

function downloadShowArticle(data,articleID){
	var downloadAgain = window.localStorage.getItem("versionDownloadAgain");

	if(articleID==false){
		printArticle(data);
	} else {
		if(downloadAgain=="true" && isOnInternet() && articleID!=false){
			requestUrlContent(mobileUrl+"article.php?articleID="+articleID,"DownloadAgain",true,articleID);
		} else {
			saveFileToSystem("article"+articleID,"json",data);
			printArticle(data);
		}
	}
}

function ajaxSuccess(data, typePetition,value){

		switch(typePetition) {
			case "FirstTimeConfiguration":
				firstTimeConfiguration(data);
				break;
			case "FirstTimeHome":
				firstTimeHome(data);
				break;
			case "CompareConfiguration":
				compareConfiguration(data);
				break;
			case "menuContentDownload":
				menuContentDownload(true,value);
				break;
			case "CatTypeDownload":
				catTypeDownload(data,value);
				break;
			case "CatTypeShow":
				catTypeShow(data,value);
				break;
			case "CatTypeDownloadAndShow":
				catTypeShow(data,value);
				catTypeDownload(data,value);
				break;
			case "Configuration":
				setUpMenuItems(data);
				break;
			case "MultipleContent":
				printMultipleContent(data);
				break;
			case "ArticleDownload":
				articleDownload(data,value);
				break;
			case "DownloadShowArticle":
				downloadShowArticle(data,value);
				break;
			case "DownloadAgain":
				downloadAgain(data,value);
				break;
			case "ArticleVerification":
			default:
				break;
		}
}

function firstTimeError() {
	setVisibleText("Imposible Conectar");
	window.localStorage.setItem('firstTimeApp', false);
	generateAlert("Imposible Conectar", "No se puede conectar con nuestro servidor en este momento, intente más tarde", "Aceptar");
}

function catTypeShowError(value){
	if(isOnInternet()){
		if(value[2]=="type"){
			requestUrlContent(mobileUrl+"cat_type.php?type="+value[0]+"&typeTitle="+value[1],"CatTypeDownloadAndShow",false,value);
		} else if(value[2]=="cat") {
			requestUrlContent(mobileUrl+"cat_type.php?category="+value[0]+"&categoryTitle="+value[1],"CatTypeDownloadAndShow",false,value);
		}
	} else {
		generateAlert("Imposible Cargar Contenido","Este articulo no ha sido descargado, intente nuvemante cuando tenga conexión a Internet","Aceptar");
	}
}

function catTypeDownloadAndShowError(){

	generateAlert("Imposible Cargar Contenido","No se ha podido conectar verifique su conexión a Internet","Aceptar");
}

function articleVerificationError(articleID){
	if(isOnInternet() && articleID!=false){
		requestUrlContent(mobileUrl+"article.php?articleID="+articleID,"ArticleDownload",true,articleID);
	}
}

function downloadAgainError(articleID){
	requestFileContentFromUrlServer("article"+articleID,"json","DownloadShowArticle",true);
}

function downloadShowArticleError(articleID,t){
	if(isOnInternet() && t!="timeout"){
		requestUrlContent(mobileUrl+"article.php?articleID="+articleID,"DownloadShowArticle",true,articleID);
	} else {
		
		generateAlert("Imposible Cargar Contenido","No se ha podido conectar verifique su conexión a Internet","Aceptar");
	}
}

function ajaxError(typePetition,value,t){
	switch(typePetition) {
		case "FirstTimeConfiguration":
		case "FirstTimeHome":
			firstTimeError();
			break;
		case "menuContentDownload":
			menuContentDownload(false,value);
			break;
		case "CatTypeShow":
			catTypeShowError(value);
			break;
		case "CatTypeDownloadAndShow":
			catTypeDownloadAndShowError();
			break;
		case "MultipleContent":
			catTypeDownloadAndShowError();
			break;
		case "ArticleVerification":
			articleVerificationError(value);
			break;
		case "DownloadShowArticle":
			downloadShowArticleError(value,t)
			break;
		case "DownloadAgain":
			downloadAgainError(value);
			break;
		case "ArticleDownload":
		case "Configuration":
		case "CompareConfiguration":
		case "CatTypeDownload":
		default:
			break;
	}
}

function requestUrlContent(urlRequest,typePetition,IsCache,value){
	setVisibleText("Se hizo peticion al servidor " + urlRequest);
	if (value===undefined) {
		value = false;
	}
	$.ajax({
		url: urlRequest,
		cache: IsCache,
		success: function(data){
			ajaxSuccess(data,typePetition,value);
		},
		error: function(x, t, m) {
			ajaxError(typePetition,value,t);
		}
	});

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
	return true;
}

function loadStyle(){
	$("head").append($('<link rel="stylesheet" href="css/'+window.localStorage.getItem('configurationTheme')+'.css" type="text/css" media="screen" />'));
	return true;
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
	return true;
}

function setupHeader(menuItems){
	if(menuItems===undefined){
		requestFileContentFromUrlServer("config","json","Configuration",true);
	} else {

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
	changeContentLoading(false);
	return true;
}

function showCategory(menuName,menuTitle,menuType){
	requestFileContentFromUrlServer(menuType+menuTitle,"json","CatTypeShow",false,[menuName,menuTitle,menuType]);
	return true;
}

function showArticle(articleID){
	requestFileContentFromUrlServer("article"+articleID,"json","DownloadShowArticle",true,articleID);
	return true;
}

function printMultipleContent(data){
	setVisibleText("El datacontent se cargo");

	data= verifyDataContent(data);
	var home = JSON.parse(data);
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
				homeHtmlString+="</div>";
			});
			homeHtmlString+="</div>";
		}
	}
	changeContent(homeHtmlString);
	changeContentLoading(false);
	downloadArticles();
}

function showMultipleContent(fileName,Extension,data){
	setVisibleText("Se Mostrara el Home");

	if(data===undefined){
		requestFileContentFromUrlServer(fileName,Extension,"MultipleContent",false);
	} else {
		printMultipleContent(data);
	}
}

function changeContent(htmlString){
	$("#content").html(htmlString);
	return true;
}

function downloadArticles(){
	$.each(articlesToDownload,function(index,value){
		setVisibleText("article to download, index: "+index+" , value: "+value);
		requestFileContentFromUrlServer("article"+value,"json","ArticleVerification",true,value);
	});
	articlesToDownload=[];
	return true;
}

function downloadMenus(){

	$.each(menusToDownload,function(index,value){
		setVisibleText("Menu to download, index: "+index+" , value: "+value[1]);
		requestFileContentFromUrlServer(value[2]+value[1],"json","menuContentDownload",true,value);
	});
	menusToDownload=[];
	return true;
}

function hideSplashScreen(){
	setTimeout(function(){
		$("#splashScreen").css("display","none");
	}, 1000);
	return true;
}

function onDeviceReady() {

	setVisibleText("Telefono Listo");
	setUpNotifications();

	if(isFirstTimeApp()){

		setFileUrlServer();
		window.localStorage.setItem("versionDownloadAgain","false");

		if(isOnInternet()){
			requestUrlContent(mobileUrl+"mconfig.php","FirstTimeConfiguration",false);
		} else {
			hideSplashScreen();
			window.localStorage.setItem('firstTimeApp',false);
			generateAlert("Sin Conexión","Se requiere internet para inicializar por primera vez la aplicación","Aceptar");
			navigator.app.exitApp();
		}

	} else {
		if(window.localStorage.getItem("versionDownloadAgain")=="true"){
			window.localStorage.setItem('configurationAppVersionLast',window.localStorage.getItem("configurationAppVersion"));
			window.localStorage.setItem("versionDownloadAgain","false");
		}

		loadStyle();
		setupHeader();

		hideSplashScreen();
		showMultipleContent("home","json");

		if(isOnInternet()){
			requestUrlContent(mobileUrl+"mconfig.php","CompareConfiguration",false);
		}
	}
	return true;
}


function requestFileContentFromUrlServer(title,extension,typePetition,IsCache,value){
	if (value===undefined) {
		value = false;
	}
	setVisibleText("Cargando archivo dentro del telefono");
	var urlToRequest=getFileUrlServer()+pathFileId+title+"."+extension;
	requestUrlContent(urlToRequest,typePetition,IsCache,value);

}

function getFileUrlServer(){
	setVisibleText("Obteniendo URL Directorio");
	return window.localStorage.getItem('directoryUrl');
}

function setFileUrlServer(){
	setVisibleText("Cargando Directorio");
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFRSuccess, fail);
	return true;
}

function onFRSuccess(fileSystem) {
	setVisibleText("Guardando Variable Directorio");
	window.localStorage.setItem('directoryUrl',fileSystem.root.toURL());
	return true;
}


function saveFileToSystem(title,extension,content) {
	setVisibleText("Guardando Archivo");

    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem){
		onFSSuccess(fileSystem,content,title,extension);
	}, fail);
	
	return true;
}
	function onFSSuccess(fileSystem,content,title,extension) {
		fileSystem.root.getFile(pathFileId+title+"."+extension, {create:true, exclusive:false}, function(fileEntry){
			gotFileEntry(fileEntry,content);
		}, fail);
		return true;
	}
		function gotFileEntry(fileEntry,content) {
			fileEntry.createWriter(function(writer){
				gotFileWriter(writer,content);
			}, fail);
			return true;
		}
			function gotFileWriter(writer,content) {
				writer.onwrite = function(evt) {
					setVisibleText("Archivo Escrito");
				};
				writer.write(content);
				return true;
			}

function changeContentLoading(isLoading){
	if(isLoading){
		contentLoadingTimeOut = setTimeout(function(){
			$("#loading").css("display","block");
		}, 500);
	} else {
		clearTimeout(contentLoadingTimeOut);
		$("#loading").css("display","none");
	}
}

$( "body" ).delegate( ".articleContentCategory", "click", function() {
	changeContentLoading(true);
	setVisibleText("se hizo click en el articulo "+$(this).attr("content-id"));
	breadcrumbsNavigation.push([$(this).attr("content-id"),"article"]);
	showArticle($(this).attr("content-id"));
	return true;
});

$( "body" ).delegate( ".menuItemHome", "click", function() {
	$(".activeMenuItem").removeClass("activeMenuItem");
	$(this).addClass("activeMenuItem");
	breadcrumbsNavigation = [];
	showMultipleContent("home","json");
	return true;
});
$( "body" ).delegate( ".menuItem,.menuItemActive", "click", function() {
	changeContentLoading(true);
	$(".activeMenuItem").removeClass("activeMenuItem");
	$(this).addClass("activeMenuItem");
	breadcrumbsNavigation.push([$(this).attr("menu-type")+$(this).attr("menu-title"),"cat_type"]);
	showCategory($(this).attr("menu-name"),$(this).attr("menu-title"),$(this).attr("menu-type"));
	return true;
});

function showToast(message,duration){
	$("#toast").html(message);
	$("#toast").fadeToggle( (duration/2), function() {
		$("#toast").fadeToggle( (duration/2), function() {

		});
	});
	return true;
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
			}
		}
	}
	return true;
}, false);

document.addEventListener('deviceready', onDeviceReady, false);

return true;

});