// Эти ссылки для примера, замените их на свои
SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1VVa2iK34fRnTXF9d7YJpqS2rVU-Z8pQw8-8AEk/edit'
SHEET = SpreadsheetApp.openByUrl(SPREADSHEET_URL).getActiveSheet()
WORKSPACE = 'accounts/17545317/containers/19457/workspaces/8'

/**
 * Выгружает имя тега, тип и json-тэга на лист в Sheets.
 * Перед  json делают отступ в колонку.
 */
function dumpTagsToSheet() {
  SHEET.clear()

  var data = []
 
  response = TagManager.Accounts.Containers.Workspaces.Tags.list(WORKSPACE)
     
  for (var i = 0;  i < response.tag.length; i++) {
   var tag = response.tag[i]
   var trackType = ''
   
   Logger.log(tag.parameter[0])
   
   // Если UA, то узнать Event или Pageview
   for (var j = 0; j < tag.parameter.length; j++) {
     var prm = tag.parameter[j]
     
     
     if (prm.key == 'trackType') {
       trackType = prm.value
     }
   }
   
   SHEET.appendRow([tag.name, tag.type, trackType, '', '', JSON.stringify(tag)])
  }
  
}


/**
 * Читает строчки с листа, изменяет имя в json-объекте 
 * и обновляет тэги в GTM.
 */
function updateTagsFromSheet() {
  var data = SHEET.getSheetValues(1, 1, SHEET.getLastRow(), SHEET.getLastColumn())
  
  // Перезаписываем имена в тэгах и отсылаем в GTM.
  for (var i = 0; i < data.length; i++) {
    var tag = JSON.parse(data[i][5])
    tag.name = data[i][0]
    
    TagManager.Accounts.Containers.Workspaces.Tags.update(
      tag,
      tag.path)
  }
 
}
