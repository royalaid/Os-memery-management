/* jshint devel:true */
console.log('\'Allo \'Allo!');

var reader = new FileReader();
var newLineArray;
var Age = 0;
var txt;
var physMemory = [];
var procControlBlock = [];
var curLine = 0;

function getLowestAge (){
  'use strict';
  var lowestAgeIndex = 0;
  for(var i = 0; i < physMemory.length; i++){
    if(physMemory[i].age < physMemory[lowestAgeIndex].age){
      lowestAgeIndex = i;
    }
  }
  return lowestAgeIndex;
}

function executeInstruction(procNum, pageNum){
  'use strict';
  Age++;
  if(procControlBlock[procNum] && procControlBlock[procNum][pageNum] !== undefined){
    var frameNum = procControlBlock[procNum][pageNum];
    physMemory[frameNum].age = Age;

  } else if (physMemory.length === 16){
    var frameUsedLongestAgo = getLowestAge();
    var procToFlush = physMemory[frameUsedLongestAgo];
    physMemory[frameUsedLongestAgo] = {proc: procNum,
                                       page: pageNum,
                                       age: Age};
    procControlBlock[procToFlush.proc][procToFlush.page] = undefined;
    if(!procControlBlock[procNum]){
      procControlBlock[procNum] = [];
    }      
    if(!procControlBlock[procNum].pageFaults){
      procControlBlock[procNum].pageFaults = 1;
    } else {
      procControlBlock[procNum].pageFaults++;
    }
    procControlBlock[procNum][pageNum] = frameUsedLongestAgo;
  } else {
    physMemory.push({proc: procNum,
                     page: pageNum, 
                     age: Age});
    if(!procControlBlock[procNum]){
      procControlBlock[procNum] = [];
    }
    if(!procControlBlock[procNum].pageFaults){
      procControlBlock[procNum].pageFaults = 1;
    } else {
      procControlBlock[procNum].pageFaults++;
    }
    procControlBlock[procNum][pageNum] = physMemory.length - 1;
  }
  var frameToGui = procControlBlock[procNum][pageNum];
  return [frameToGui, procNum, pageNum];
}

function magic(lineNum){
  'use strict';
  var line = newLineArray[lineNum].split(':');
  var frameInfo = executeInstruction(line[0], parseInt(line[1],2));
  console.log(Age);
  return frameInfo;
}

function buildPageTableGuiRow(frameNumber, procNumber, pageNumber){
  'use strict';
  var $row = $('<div>', {class: 'row', id:'frame' + frameNumber});
  var $frameCol = $('<div>', {class: 'col-xs-4 text-center'}).text(frameNumber);
  var $processCol =$('<div>', {class: 'col-xs-4 text-center'}).text(procNumber);
  var $pageCol = $('<div>', {class: 'col-xs-4 text-center'}).text(pageNumber);
  return $row.append($frameCol, $processCol, $pageCol);
}

function buildProcTableGuiRow(procNum){
  'use strict';
  var $row = $('<div>', {class: 'row page row', id:procNum});
  var $procCol = $('<div>', {class: 'col-xs-2 text-center'}).text(procNum);
  var $procPages = $('<div>', {class:'text-center row col-xs-offset-2 bot-border'});
  for (var i = 0;i < procControlBlock[procNum].length;i++){
    var $procCel = $('<div>', {class:'col-xs-1'});
    var $procContents = $('<b>').text(i+':');
    if(procControlBlock[procNum][i] !== undefined){
      $procCel.append($procContents, document.createTextNode(procControlBlock[procNum][i]));
    }
    else{
      var $glyph = $('<span>', {class:'glyphicon glyphicon-ban-circle'});
      $procCel.append($procContents, $glyph);
    }
    $procPages.append($procCel);
  }
  return $row.append($procCol, $procPages);
}

$(document).ready( function() {
  'use strict';
  $('.btn-file :file').on('fileselect', function(event, numFiles, label) {
    $('#fileBox button').prop('disabled', false);
    var input = $(this).parents('.input-group').find(':text'),
      log = numFiles > 1 ? numFiles + ' files selected' : label;
    if( input.length ) {
      input.val(log);
    } else {
      if( log ){ alert(log);}
    }        
  });
});

$(document).on('change', '.btn-file :file', function() {
  'use strict';
  var input = $(this),
  numFiles = input.get(0).files ? input.get(0).files.length : 1,
  label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
  input.trigger('fileselect', [numFiles, label]);
});

$('#step').click(function() {
  'use strict';
  var frameInfo = magic(curLine);
  var $row = buildPageTableGuiRow(frameInfo[0], frameInfo[1], frameInfo[2]);
  var $procRow = buildProcTableGuiRow(frameInfo[1]);
  curLine++;
  if(curLine >= newLineArray.length){  
    $('#step').hide();
    $('#step-to-fault').hide();
    $('#step-to-end').hide();
  }
  $('#frame'+frameInfo[0]).fadeOut(function () {
      $('#frame'+frameInfo[0]).replaceWith($row).fadeIn();
  });
  
  $('#'+frameInfo[1]).fadeOut(function () {
      $('#'+frameInfo[1]).replaceWith($procRow).fadeIn();
  });
    
});

$('#step-to-fault').click(function() {
  'use strict';
  var nextFaultIndex;
  if(physMemory.length < 16){
    nextFaultIndex = physMemory.length;
  } else {
    nextFaultIndex = getLowestAge();
  }
  var frameInfo = magic(curLine);
  while(frameInfo[0] !== nextFaultIndex){
    frameInfo = magic(curLine);
    curLine++;
    if(curLine === newLineArray.length){
      break;
    }
  }
  if(curLine >= newLineArray.length){  
    $('#step').hide();
    $('#step-to-fault').hide();
    $('#step-to-end').hide();
  }
  for(var i = 0; i < physMemory.length; i++){
    var $row = buildPageTableGuiRow(i, physMemory[i].proc, physMemory[i].page);
    $('#frame'+i).replaceWith($row);    
  }

  for (var property in procControlBlock) {
    if (procControlBlock.hasOwnProperty(property)) {
      var $procRow = buildProcTableGuiRow(property);
      $('#'+property).replaceWith($procRow);
    }
  }
});

$('#step-to-end').click(function () {
  'use strict';
  var frameInfo = magic(curLine);
  for(;curLine < newLineArray.length; curLine++){
    frameInfo = magic(curLine);
  }
  for(var i = 0; i < 16; i++){
    var $row = buildPageTableGuiRow(i, physMemory[i].proc, physMemory[i].page);
    $('#frame'+i).replaceWith($row);
  }

  for (var property in procControlBlock) {
    if (procControlBlock.hasOwnProperty(property)) {
      var $procRow = buildProcTableGuiRow(property);
      $('#'+property).replaceWith($procRow);
    }
  }
  
  $('#step').hide();
  $('#step-to-fault').hide();
  $('#step-to-end').hide();
});

$('#fileBox').submit(function (e) {
  'use strict';
  e.preventDefault();
  $('.reveal').toggle();
  $('#fileBox').hide();
  reader.readAsText($('#fileBox input[type=file]').get(0).files[0]);
  txt = undefined;
});

reader.onload = (function() {
  'use strict';
  return function(e){
    newLineArray = e.target.result.split('\n');
    newLineArray.pop(); //Remove empty last element
  };
}(txt));