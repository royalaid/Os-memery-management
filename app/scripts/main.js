/* jshint devel:true */
console.log('\'Allo \'Allo!');

var reader = new FileReader();
var txt;

$(document).ready( function() {
  $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
    $('#fileBox button').prop('disabled', false);
    var input = $(this).parents('.input-group').find(':text'),
      log = numFiles > 1 ? numFiles + ' files selected' : label;
    if( input.length ) {
      input.val(log);
    } else {
      if( log ) alert(log);
    }        
  });
});

$(document).on('change', '.btn-file :file', function() {
  var input = $(this),
  numFiles = input.get(0).files ? input.get(0).files.length : 1,
  label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
  input.trigger('fileselect', [numFiles, label]);
});

$('#fileBox').submit(function (e) {
  e.preventDefault();
  $('.page-table').removeClass('hidden');
  $('#fileBox').hide();
  reader.readAsText($("#fileBox input[type=file]").get(0).files[0]);
});

reader.onload = (function(txt) {
  return function(e){
    magic(e.target.result)
  };
  console.log(txt);
}(txt));

function magic(txt){
  var newLineArray = txt.split('\n');
  newLineArray.pop(); //Remove empty last element
  for(i = 0; i < newLineArray.length; i++){
    line = newLineArray[i].split(':');
    line[1] = line[1].substr(1);
    console.log(line);
  }
};

