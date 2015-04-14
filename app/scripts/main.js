/* jshint devel:true */
console.log('\'Allo \'Allo!');

var reader = new FileReader();

$('#fileBox').fileinput({
  uploadUrl: 'parseFile()',
  showPreview: false
})



$('#fileBox').submit( function(e) {
  console.log('Uploaded')
});


$('#fileBox').change( function(files) {
  var fileList = this.files; /* now you can work with the file list */
  console.log(fileList[0]);
  reader.readAsText(fileList[0]);
});



var txt;

$('.fileinput-upload-button').click(function (e) {
  $()
  console.log('you');
});


reader.onload = (function(txt) {
  return function(e){
    console.log(e.target.result)
  };
  console.log(txt);
}(txt));