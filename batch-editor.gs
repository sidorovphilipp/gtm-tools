// Эти ссылки для примера, замените их на свои.
SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1VVa2iKfRnTsdf7YJpqS2rVU-Z8pQw8-8AEk/edit';
SHEET = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getActiveSheet();
WORKSPACE = 'accounts/1444045317/containers/193634317/workspaces/8';

/**
 * Выгружает имя тега, тип и json-тэга на лист в Sheets.
 * Перед  json делают отступ в колонку.
 */
function dumpTagsToSheet() {
  SHEET.clear();

  var data = [];
 
  response = TagManager.Accounts.Containers.Workspaces.Tags.list(WORKSPACE);
     
  for (var i = 0;  i < response.tag.length; i++) {
   var tag = response.tag[i];
   var trackType = '';
   
   Logger.log(tag.parameter[0]);
   
   // Если UA, то узнать Event или Pageview
   for (var j = 0; j < tag.parameter.length; j++) {
     var prm = tag.parameter[j];
     
     
     if (prm.key == 'trackType') {
       trackType = prm.value;
     }
   }
   
   SHEET.appendRow([
     tag.name, 
     tag.type, 
     trackType,
     beautifyName(tag.name, tag.type, trackType),
     '', '', '',
     JSON.stringify(tag)]);
  }
  
}


/**
 * Читает строчки с листа, изменяет имя в json-объекте 
 * и обновляет тэги в GTM.
 */
function updateTagsFromSheet() {
  var data = SHEET.getSheetValues(1, 1, SHEET.getLastRow(), SHEET.getLastColumn());
  
  // Перезаписываем имена в тэгах и отсылаем в GTM.
  for (var i = 0; i < data.length; i++) {
    var tag = JSON.parse(data[i][7]);
    tag.name = data[i][3];
    
    if (tag.name !== '') {
      TagManager.Accounts.Containers.Workspaces.Tags.update(
        tag,
        tag.path);    
    }    
  }
}


/**
 * Принимает имя сущености, тип, дополнение, 
 * затем меняет имя по шаблону.
**/
function beautifyName(name, type, subtype) {
  var prefix = ''; 
  var sep = ' - ';
  
  name = name.charAt(0).toUpperCase() + name.substr(1);
  
  switch (type) {
    case 'ua':
      if (subtype === 'TRACK_EVENT') {
        prefix = 'GA Event';
      }  else if (subtype === 'TRACK_PAGEVIEW') {
        prefix = 'GA Pageview';
      }
      break;
    case 'html':
      prefix = 'Script';
      break;
    default:
      prefix = ''
      
  }
  
  if (!name.match(prefix)) {    
    return prefix + sep + name;
  } else {
    return '';
  }
  
}
