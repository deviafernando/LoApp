var pathFileId = "Android/data/com.imagina.enibague/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";
var articlesToDownload = [];
var menusToDownload = [];
var breadcrumbsNavigation = [];
var menuStatus=false;
var readyToExit=false;
var contentLoadingTimeOut;
var currentCatType = [];
var actualCountToDownload=10;

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
	//$("#debuger").append(message);
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
	requestUrlContent(mobileUrl+"homeItems.php","FirstTimeHome",true);
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
		requestUrlContent(mobileUrl+"homeItems.php","catTypeDownload",false);
		setConfigurationVariables(configuration);
	}
}

function menuContentDownload(fileExist,value){
	var downloadAgain = window.localStorage.getItem("versionDownloadAgain");

	if(!fileExist || downloadAgain=="true"){
		if(value[2]=="type"){
			requestUrlContent(mobileUrl+"cat_type.php?count=10&type="+value[0]+"&typeTitle="+value[1],"CatTypeDownload",false,value);
		} else if(value[2]=="category") {
			requestUrlContent(mobileUrl+"cat_type.php?count=10&category="+value[0]+"&categoryTitle="+value[1],"CatTypeDownload",false,value);
		} else if(value[2]=="subcategories") {
			requestUrlContent(mobileUrl+"subcategory.php?category="+value[0]+"&categoryTitle="+value[1],"subCategoryDownload",false,value);
		}
	}
}

function catTypeDownload(data,value){
	saveFileToSystem(value[2]+value[1],"json",data);
}

function catTypeDownloadAndShowAgain(data,value){
	saveFileToSystem(value[2]+value[1],"json",data);
	showMultipleContent(value[2]+value[1],"json",data);
}
function catTypeShow(data,value){
	var downloadAgain = window.localStorage.getItem("versionDownloadAgain");
	if(downloadAgain=="true" && isOnInternet()){
		if(value[2]=="type"){
			requestUrlContent(mobileUrl+"cat_type.php?count=10&type="+value[0]+"&typeTitle="+value[1],"CatTypeDownloadAndShowAgain",false,value);
		} else if(value[2]=="category") {
			requestUrlContent(mobileUrl+"cat_type.php?count=10&category="+value[0]+"&categoryTitle="+value[1],"CatTypeDownloadAndShowAgain",false,value);
		} else if(value[2]=="subcategories") {
			requestUrlContent(mobileUrl+"subcategory.php?category="+value[0]+"&categoryTitle="+value[1],"subCatTypeDownloadAndShowAgain",false,value);
		}
	}

	if(value[2]=="subcategories"){
		showMultipleCategories(value[2]+value[1],"json",data);
	} else {
		showMultipleContent(value[2]+value[1],"json",data);
	}
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
			case "subCatTypeDownloadAndShowAgain":
			case "CatTypeDownloadAndShowAgain":
				catTypeDownloadAndShowAgain(data,value);
				break;
			case "subCategoryDownload":
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
			case "MultipleCategories":
				printMultiplesCategories(data);
				break;
			case "MultipleContent":
				showMultipleContent(value[0],value[1],data);
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
			case "SearchRequest":
				printSearch(data);
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
			requestUrlContent(mobileUrl+"cat_type.php?count=10&type="+value[0]+"&typeTitle="+value[1],"CatTypeDownloadAndShow",false,value);
		} else if(value[2]=="category") {
			requestUrlContent(mobileUrl+"cat_type.php?count=10&category="+value[0]+"&categoryTitle="+value[1],"CatTypeDownloadAndShow",false,value);
		} else if(value[2]=="subcategories") {
			requestUrlContent(mobileUrl+"subcategory.php?category="+value[0]+"&categoryTitle="+value[1],"CatTypeDownloadAndShow",false,value);
		}
	} else {
		generateAlert("Imposible Cargar Contenido","Este articulo no ha sido descargado, intente nuvemante cuando tenga conexión a Internet","Aceptar");
		changeContentLoading(false);
		breadcrumbsNavigation.pop();
	}
}

function catTypeDownloadAndShowError(){
	generateAlert("Imposible Cargar Contenido","No se ha podido conectar verifique su conexión a Internet","Aceptar");
	changeContentLoading(false);
	breadcrumbsNavigation.pop();
}

function articleVerificationError(articleID){
	if(isOnInternet() && articleID!=false){
		requestUrlContent(mobileUrl+"article.php?articleID="+articleID,"ArticleDownload",true,articleID);
	}
}

function downloadShowArticleError(articleID,t){
	if(isOnInternet() && t!="timeout"){
		requestUrlContent(mobileUrl+"article.php?articleID="+articleID,"DownloadShowArticle",true,articleID);
	} else {
		generateAlert("Imposible Cargar Contenido","No se ha podido conectar verifique su conexión a Internet","Aceptar");
		changeContentLoading(false);
		breadcrumbsNavigation.pop();
	}
}

function requestSearchError(){
	generateAlert("Imposible Conectar", "Esta función solo esta disponible si esta conectado a internet", "Aceptar");
	changeContentLoading(false);
}

function catTypeDownloadAndShowAgainError(){
	changeContentLoading(false);
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
			downloadShowArticleError(value,t);
			break;
		case "SearchRequest":
			requestSearchError();
			break;
		case "CatTypeDownloadAndShowAgain":
			catTypeDownloadAndShowAgainError();
			break;
		case "DownloadAgain":
		case "ArticleDownload":
		case "Configuration":
		case "CompareConfiguration":
		case "CatTypeDownload":
		case "subCategoryDownload":
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

		homeHtmlString+='<div id="logo">';
		if(logo!="false"){
			homeHtmlString+='<img src="'+logo+'"/>';
		} else {
			homeHtmlString+=window.localStorage.getItem('configurationSiteName');
		}
		homeHtmlString+='</div>';


		menuHtmlString+='<div class="menuItemHome" menu-name="home" menu-type="home">';
			menuHtmlString+='INICIO';
		menuHtmlString+='</div>';


		$.each(menuItems,function(index,value){
				menuHtmlString+='<div class="menuItem" menu-title="'+value[1]+'" menu-name="'+value[0]+'" menu-type="'+value[2]+'">';
				menusToDownload.push(value);
					menuHtmlString+=value[1];
				menuHtmlString+='</div>';
		});



		menuHtmlString+='<div class="menuItemSearch">';
			menuHtmlString+='BUSCAR';
		menuHtmlString+='</div>';

		$("#drawer-menu").html(menuHtmlString);
		setUpMenuFunctions();

		$("#header").html(homeHtmlString);
		$("#content").css("margin-top",$("#header").height());

		downloadMenus();
	}
}

function setUpMenuFunctions(){
	$(".drawer").drawer();
	$('.drawer').on('drawer.opened',function(){
		menuStatus=true;
	});
	$('.drawer').on('drawer.closed',function(){
		menuStatus=false;
	});
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
		homeHtmlString+="<h1>"+article.post_title+"</h1>";
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

function loadSearchFormListener(){
	$( "#search-form" ).submit(function( event ) {
		event.preventDefault();
		setVisibleText( "Buscando..." );

		if(isOnInternet()){
			var searchWord = $("#search-input").val();
			changeContentLoading(true);
			requestUrlContent(mobileUrl+"searchRequest.php?searchString="+searchWord,"SearchRequest",true);
		} else {
			generateAlert("Imposible Conectar", "Esta función solo esta disponible si esta conectado a internet", "Aceptar");
		}


	});
}

function showSearch(){
	setVisibleText("El datacontent se cargo");
	var homeHtmlString='<div class="catTypesContainer">';
		homeHtmlString+="<h1>BUSCAR</h1>";
		homeHtmlString+='<form id="search-form" class="form-wrapper cf"><input id="search-input" type="text" placeholder="Buscar..." required><button type="submit">Buscar</button></form>';
		homeHtmlString+='<div id="searchResults"></div>';
	homeHtmlString+='</div>';
	changeContent(homeHtmlString);
	loadSearchFormListener();
}

function showArticle(articleID){
	requestFileContentFromUrlServer("article"+articleID,"json","DownloadShowArticle",true,articleID);
	return true;
}

function printMultiplesCategories(data){
	setVisibleText("El datacontent se cargo");

	data= verifyDataContent(data);

	try{
		var home = JSON.parse(data);

		var homeHtmlString="";

		for (var key in home) {
			if (home.hasOwnProperty(key)) {
				homeHtmlString+='<div class="catTypesContainer">';
				homeHtmlString+="<h1>"+key+"</h1>";
				homeHtmlString+='<div class="row">';
				var i=0;
				home[key].forEach(function(category) {
					i++;

					menusToDownload.push([category.ID,category.cat_title,category.cat_type]);

					homeHtmlString+='<div class="subcategoryContentCategory col-sm-2" cat-title="'+category.cat_title+'" cat-type="'+category.cat_type+'" cat-id="'+category.ID+'">';
						homeHtmlString+="<h2>"+category.cat_title+"</h2>";
					homeHtmlString+="</div>";

					if(i%2==0){
						homeHtmlString+='<div class="row">';
						homeHtmlString+="</div>";
					}

				});
				homeHtmlString+="</div>";
				homeHtmlString+="</div>";
			}
		}

		changeContent(homeHtmlString);
		downloadMenus();

	} catch(e){
		generateAlert("Error","La categoría a la que intenta acceder no esta disponible, porfavor intente mas tarde","Aceptar");
	}
	changeContentLoading(false);

}

function printHome(data){
	setVisibleText("El datacontent se cargo");

	data= verifyDataContent(data);
	try {
		var home = JSON.parse(data);
		var homeHtmlString="";
		for (var key in home) {
			if (home.hasOwnProperty(key)) {
				homeHtmlString+='<div class="homeContainer">';
				homeHtmlString+="<h1>"+key+"</h1>";
				homeHtmlString+='<div class="backgroundContainer"></div>';
				home[key].forEach(function(menu) {
					homeHtmlString+='<div class="menuItem '+menu[1]+'" menu-title="'+menu[1]+'" menu-name="'+menu[0]+'" menu-type="'+menu[2]+'">';
					homeHtmlString+=menu[1];
					homeHtmlString+='</div>';
				});

				homeHtmlString+='<div class="menuItemSearch">';
				homeHtmlString+='BUSCAR';
				homeHtmlString+='</div>';
				homeHtmlString+="</div>";
			}
		}
		changeContent(homeHtmlString);
	} catch(e){
		generateAlert("Error","La categoría a la que intenta acceder no esta disponible, porfavor intente mas tarde","Aceptar");
	}
	changeContentLoading(false);

}


function printSearch(data){
	setVisibleText("El datacontent se cargo");
	data= verifyDataContent(data);
	try
	{
		var home = JSON.parse(data);
		var homeHtmlString="";
		for (var key in home) {
			if (home.hasOwnProperty(key)) {
				home[key].forEach(function(article) {
					articlesToDownload.push(article.ID);
					homeHtmlString+='<div class="articleContentCategory" content-id="'+article.ID+'">';
					homeHtmlString+="<h2>"+article.post_title+"</h2>";
					homeHtmlString+='<img src="'+article.featured_image+'"/>';
					homeHtmlString+="<p>"+article.post_excerpt+"</p>";
					homeHtmlString+='<br class="clear" />';
					homeHtmlString+="</div>";
				});
			}
		}
		$("#searchResults").html(homeHtmlString);

		downloadArticles();
	} catch(e){
		//generateAlert("Error","La busqueda que intenta hacer no esta disponible, porfavor intente mas tarde","Aceptar");
	}
	changeContentLoading(false);
}


function printMultipleContent(data){
	setVisibleText("El datacontent se cargo");

	data= verifyDataContent(data);
	try {
		var home = JSON.parse(data);
		var homeHtmlString="";
		for (var key in home) {
			if (home.hasOwnProperty(key)) {
				homeHtmlString+='<div class="catTypesContainer">';
				homeHtmlString+="<h1>"+key+"</h1>";
				home[key].forEach(function(article) {
					articlesToDownload.push(article.ID);
					homeHtmlString+='<div class="loadMore">CARGAR MÁS</div>';
					homeHtmlString+='<div class="articleContentCategory" content-id="'+article.ID+'">';
					homeHtmlString+="<h2>"+article.post_title+"</h2>";
					homeHtmlString+='<img src="'+article.featured_image+'"/>';
					homeHtmlString+="<p>"+article.post_excerpt+"</p>";
					homeHtmlString+='<br class="clear" />';
					homeHtmlString+="</div>";
				});
				homeHtmlString+="</div>";
			}
		}
		changeContent(homeHtmlString);
		downloadArticles();
	} catch(e){
		//generateAlert("Error","La busqueda que intenta hacer no esta disponible, porfavor intente mas tarde","Aceptar");
	}
	changeContentLoading(false);
}

function showMultipleCategories(fileName,Extension,data){
	setVisibleText("Se Mostrara un contenido multiple de categorias");
	if(data===undefined){
		requestFileContentFromUrlServer(fileName,Extension,"MultipleCategories",false);
	} else {
		printMultiplesCategories(data);
	}
}

function showMultipleContent(fileName,Extension,data){
	setVisibleText("Se Mostrara un contenido multiple");

	if(data===undefined){
		requestFileContentFromUrlServer(fileName,Extension,"MultipleContent",false,[fileName,Extension]);
	} else {
		if(fileName=="home"){
			printHome(data);
		} else {
			printMultipleContent(data);
		}

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

$( "body" ).delegate( "h1,.closeMenu", "click", function() {
	$('.drawer').drawer('toggle');
});

$(window).touchwipe({
	wipeLeft: function() {
		$('.drawer').drawer('close');
	},
	wipeRight: function() {
		$('.drawer').drawer('open');
	},
	preventDefaultEvents: false
});

$( "body" ).delegate( ".subcategoryContentCategory", "click", function() {
	changeContentLoading(true);
	breadcrumbsNavigation.push([$(this).attr("cat-type")+$(this).attr("cat-title"),$(this).attr("cat-type")]);
	currentCatType=[$(this).attr("cat-id"),$(this).attr("cat-title"),$(this).attr("cat-type")];
	actualCountToDownload=10;
	showCategory($(this).attr("cat-id"),$(this).attr("cat-title"),$(this).attr("cat-type"));
	return true;
});

$( "body" ).delegate( ".articleContentCategory", "click", function() {
	changeContentLoading(true);
	setVisibleText("se hizo click en el articulo "+$(this).attr("content-id"));
	breadcrumbsNavigation.push([$(this).attr("content-id"),"article"]);
	showArticle($(this).attr("content-id"));
	return true;
});

$( "body" ).delegate( ".menuItemHome,#logo", "click", function() {
	$('.drawer').drawer('close');
	$(".activeMenuItem").removeClass("activeMenuItem");
	$(this).addClass("activeMenuItem");
	breadcrumbsNavigation = [];
	showMultipleContent("home","json");
	return true;
});

$( "body" ).delegate( ".menuItemSearch", "click", function() {
	$('.drawer').drawer('close');
	if(isOnInternet()){
		showSearch();
		$(".activeMenuItem").removeClass("activeMenuItem");
		$(this).addClass("activeMenuItem");
		breadcrumbsNavigation.push([false,"search"]);
	} else {
		generateAlert("Imposible Conectar", "Esta función solo esta disponible si esta conectado a internet", "Aceptar");
	}

});

$( "body" ).delegate( ".loadMore", "click", function() {
	$('.drawer').drawer('close');
	changeContentLoading(true);

	actualCountToDownload+=10;

	if(currentCatType[2]=="type"){
		requestUrlContent(mobileUrl+"cat_type.php?count="+actualCountToDownload+"&type="+currentCatType[0]+"&typeTitle="+currentCatType[1],"CatTypeDownloadAndShowAgain",true,currentCatType);
	} else if(currentCatType[2]=="category") {
		requestUrlContent(mobileUrl+"cat_type.php?count="+actualCountToDownload+"&category="+currentCatType[0]+"&categoryTitle="+currentCatType[1],"CatTypeDownloadAndShowAgain",true,currentCatType);
	} else {
		changeContentLoading(false)
	}

	return true;
});

$(window).scroll(function() {

	if($(window).scrollTop() + $(window).height() == $(document).height()) {
		if(currentCatType[2]=="type"){
			requestUrlContent(mobileUrl+"cat_type.php?count="+actualCountToDownload+"&type="+currentCatType[0]+"&typeTitle="+currentCatType[1],"CatTypeDownload",true,currentCatType);
		} else if(currentCatType[2]=="category") {
			requestUrlContent(mobileUrl+"cat_type.php?count="+actualCountToDownload+"&category="+currentCatType[0]+"&categoryTitle="+currentCatType[1],"CatTypeDownload",true,currentCatType);
		}
	}
});

$( "body" ).delegate( ".menuItem,.menuItemActive", "click", function() {
	$('.drawer').drawer('close');
	changeContentLoading(true);
	$(".activeMenuItem").removeClass("activeMenuItem");
	$(this).addClass("activeMenuItem");
	breadcrumbsNavigation.push([$(this).attr("menu-type")+$(this).attr("menu-title"),$(this).attr("menu-type")]);
	currentCatType = [$(this).attr("menu-name"),$(this).attr("menu-title"),$(this).attr("menu-type")];
	actualCountToDownload=10;
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
			$('.drawer').drawer('close');
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
				} else if(lastPage[1]=="subcategories") {
					showMultipleCategories(lastPage[0],"json");
				} else if(lastPage[1]=="search") {
					showSearch();
				} else {
					showMultipleContent(lastPage[0],"json")
				}
			}
		}
	}
	return true;
}, false);

document.addEventListener('deviceready', onDeviceReady, false);

	//NOTIFICATIONS
	var pushNotification;

	function setNotificationVisibleText(message){
		//$("#debuger").append(message);
	}

	function setUpNotifications() {
		setNotificationVisibleText('<li>deviceready event received</li>');

		try
		{
			pushNotification = window.plugins.pushNotification;
			setNotificationVisibleText('<li>registering ' + device.platform + '</li>');
			if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos' ) {
				pushNotification.register(successHandler, errorHandler, {"senderID":"183128038002","ecb":"onNotification"});
			} else {
				pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
			}
		}
		catch(err)
		{
			txt="There was an error on this page.\n\n";
			txt+="Error description: " + err.message + "\n\n";
			setNotificationVisibleText(txt);
		}
	}

	// handle APNS notifications for iOS
	function onNotificationAPN(e) {
		if (e.alert) {
			setNotificationVisibleText('<li>push-notification: ' + e.alert + '</li>');
			// showing an alert also requires the org.apache.cordova.dialogs plugin
			navigator.notification.alert(e.alert);
		}

		if (e.sound) {
			// playing a sound also requires the org.apache.cordova.media plugin
			var snd = new Media(e.sound);
			snd.play();
		}

		if (e.badge) {
			pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
		}
	}

	function sendRegId(regid){
		$.ajax({
			url: 'http://m.enibague.com/saveregid.php',
			type: 'GET',
			data: 'regid='+regid,
			success: function(data) {
				setNotificationVisibleText(data);
			},
			error: function(e) {

			}
		});
	}


	// handle GCM notifications for Android
	function onNotification(e) {
		setNotificationVisibleText('<li>EVENT -> RECEIVED:' + e.event + '</li>');

		switch( e.event )
		{
			case 'registered':
				if ( e.regid.length > 0 )
				{
					setNotificationVisibleText('<li>REGISTERED -> REGID:' + e.regid + "</li>");
					// Your GCM push server needs to know the regID before it can push to this device
					// here is where you might want to send it the regID for later use.
					setNotificationVisibleText("regID = " + e.regid);
					sendRegId(e.regid);
				}
				break;

			case 'message':
				// if this flag is set, this notification happened while we were in the foreground.
				// you might want to play a sound to get the user's attention, throw up a dialog, etc.
				if (e.foreground)
				{
					setNotificationVisibleText('<li>--INLINE NOTIFICATION--' + '</li>');

					// on Android soundname is outside the payload.
					// On Amazon FireOS all custom attributes are contained within payload
					var soundfile = e.soundname || e.payload.sound;
					// if the notification contains a soundname, play it.
					// playing a sound also requires the org.apache.cordova.media plugin
					var my_media = new Media("/android_asset/www/"+ soundfile);

					my_media.play();
				}
				else
				{	// otherwise we were launched because the user touched a notification in the notification tray.
					if (e.coldstart)
						setNotificationVisibleText('<li>--COLDSTART NOTIFICATION--' + '</li>');
					else
						setNotificationVisibleText('<li>--BACKGROUND NOTIFICATION--' + '</li>');
				}

				setNotificationVisibleText('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
				//android only
				setNotificationVisibleText('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
				//amazon-fireos only
				setNotificationVisibleText('<li>MESSAGE -> TIMESTAMP: ' + e.payload.timeStamp + '</li>');
				window.localStorage.setItem("versionDownloadAgain","true");

				if(e.payload.ntype=="category"){
					showCategory(e.payload.catname,e.payload.cattitle,e.payload.cattype);
					changeContentLoading(true);

				} else if(e.payload.ntype=="article"){
					showArticle(e.payload.artid);
					changeContentLoading(true);
				}

				break;

			case 'error':
				setNotificationVisibleText('<li>ERROR -> MSG:' + e.msg + '</li>');
				break;

			default:
				setNotificationVisibleText('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
				break;
		}
	}

	function tokenHandler (result) {
		setNotificationVisibleText('<li>token: '+ result +'</li>');
		// Your iOS push server needs to know the token before it can push to this device
		// here is where you might want to send it the token for later use.
	}

	function successHandler (result) {
		setNotificationVisibleText('<li>success:'+ result +'</li>');
	}

	function errorHandler (error) {
		setNotificationVisibleText('<li>error:'+ error +'</li>');
	}


