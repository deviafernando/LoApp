document.addEventListener('deviceready', onDeviceReady, false);

var pathFileId = "Android/data/com.phonegap.helloworld/";
var mainUrl = "http://www.enibague.com/";
var mobileUrl = "http://www.m.enibague.com/";

var fileTitle="";
var fileExtension="";
var fileContent="";

function isOnInternet(){
	if(navigator.connection.type=="Connection.NONE"){
		return false;
	} else {
		return true;
	};
}

function fail(e) {
	alert("FileSystem Error");
	console.dir(e);
}

function getUrlContent(urlRequest){
	var response = false;
	
	$.ajax({
		url: urlRequest,
        async: false,
		cache: false,
		success: function(data){
			return data;
		},
		error: function() { 
			response = false;
		}
	});
	
	return response;
	
}

function isFirstTimeApp(){
	
	firstTimeApp=window.localStorage.getItem('firstTimeApp');
	if(firstTimeApp){
		return false;
	} else {
		window.localStorage.setItem('firstTimeApp',true);
		return true;
	}
	
}

function generateAlert(title,message,button){
	navigator.notification.alert(
		message,
		function() {

		},
		title,
		button
	);
}
	
function onDeviceReady() {
	if(isFirstTimeApp()){
		if(isOnInternet){
			var dataContent=getUrlContent(mobileUrl+"mconfig.php");
			alert(dataContent);
			saveFileToSystem(title,format);

		} else {
			window.localStorage.setItem('firstTimeApp',false);
			generateAlert("Sin Conexión","Se requiere internet la primera vez que inicialice la aplicación","Aceptar");
			navigator.app.exitApp();
		}
	}else {
	}
}

function getHtmlToShow(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFRSuccess, fail);
}
	function onFRSuccess(fileSystem) {
		fileSystem.root.getFile(pathFileId+htmlTitleShow+".html", {create:false, exclusive:false}, gotFileEntryToRead, fail);
	}
		function gotFileEntryToRead(fileEntry) {
			alert("FileEntry Success");
			$( "#results" ).load(fileEntry.toURL()+" #mainwrapper");
			alert(fileEntry.toURL());
			
		}



function saveFileToSystem(title,extension) {
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
				writer.onwrite = function(evt) {};
				writer.write(fileContent);
			}