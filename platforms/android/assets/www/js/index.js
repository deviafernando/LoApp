document.addEventListener('deviceready', onDeviceReady, false);

var pathFileId = "Android/data/com.phonegap.helloworld/";
var mainUrl = "http://www.enibague.com/"
var htmlToSave = "";
var htmlTitleShow = "";
var htmlTitle = "";

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

function getWebHtml(urlRequest,titleToSave){
	htmlTitle=titleToSave;
	var response = false;
	
	$.ajax({
		url: urlRequest,
        async: false,
		cache: false,
		success: function(html){
			htmlToSave=html;
			saveFileToSystem();
			response = true;
		},
		error: function() { 
			response = false;
		},
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

	
function onDeviceReady() {
	//if(isFirstTimeApp()){
		//if(isOnInternet){
			var htmlText=getWebHtml(mainUrl,"home");
			htmlTitleShow="home";
			alert(htmlTitleShow);
			getHtmlToShow();
			//$("#results").html(htmlText);
		//} else {
			//necesita Internet la primera vez que inicialice su aplicación
		//};
	//}else {
	
	//};
}

function getHtmlToShow(){
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFRSuccess, onFSRError);
}
	function onFRSuccess(fileSystem) {
		fileSystem.root.getFile(pathFileId+htmlTitleShow+".html", {create:false, exclusive:false}, gotFileEntryToRead, onFSRError);
	}
		function gotFileEntryToRead(fileEntry) {
			alert("FileEntry Success");
			$( "#results" ).load(fileEntry.toURL()+" #mainwrapper");
			alert(fileEntry.toURL());
			
		}
	
	
function saveFileToSystem() {
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFSSuccess, onFSRError);
}
	function onFSSuccess(fileSystem) {
		fileSystem.root.getFile(pathFileId+htmlTitle+".html", {create:true, exclusive:false}, gotFileEntry, onFSRError);
	}
		function gotFileEntry(fileEntry) {
			fileEntry.createWriter(gotFileWriter, onFSRError);
		}
			function gotFileWriter(writer) {
				writer.onwrite = function(evt) {};
				writer.write(htmlToSave);
			}
function onFSRError(err) {
	
}