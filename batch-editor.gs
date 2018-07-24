// Эти ссылки для примера, замените их на свои
var SPSHEET = SpreadsheetApp.getActiveSpreadsheet();
var SHEET = SPSHEET.getActiveSheet();
var WORKSPACE = 'accounts/144014/containers/2443029/workspaces/2143';


var RULES = {
  "v":                   "dlv",
  "j":                   "jsv",
  "k":                   "cookie",
  "jsm":                 "cjsv",
  "gas":                 "gas",
  "c":                   "const",
  "customEvent":         "ce",
  "timer":               "timer",
  "jsError":             "jserr",
  "click":               "click",
  "pageview":            "pageview",
  "linkClick":           "click",
  "click":               "click",
  "domReady":            "dom",
  "windowLoaded":        "window",
  "historyChange":       "hist",
  "ua track_event":      "GA Event",
  "ua track_pageview":   "GA Pageview",
  "html":                "Script"
};


// Обёртка, чтобы cразу выгрузить тэги, триггеры и прочее.
function dumpGTM() {
  dumpEntsToSheets('Tag');
  dumpEntsToSheets('Trigger');
  dumpEntsToSheets('Variable');
}


// Обёртка, чтобы обновить сущности в GTM.
function updateGTM() {
  updateEntsFromSheet('Variable');
  updateEntsFromSheet('Trigger');
  updateEntsFromSheet('Tag');
}


/**
 * Выгружает имя cущности и json-объекта на лист в Sheets.
 * Перед  json делают отступ в колонку.
 */
function dumpEntsToSheets(kind) {
  refreshList(kind);  
  var data = [];
   
  if (kind === 'Tag') {
    var response = TagManager.Accounts.Containers.Workspaces.Tags.list(WORKSPACE);
    var respData = response['tag'];
  } else if (kind === 'Trigger') {
    var response = TagManager.Accounts.Containers.Workspaces.Triggers.list(WORKSPACE);
    var respData = response['trigger'];
  } else if (kind === 'Variable') {
    var response = TagManager.Accounts.Containers.Workspaces.Variables.list(WORKSPACE);
    var respData = response['variable'];
  }
     
  for (var i = 0;  i < respData.length; i++) {
   var ent = respData[i];
   var trackType = "";
      
   // Если Universal Analytics, узнает Event или Pageview.
   if (ent.type === "ua") {
     for (var j = 0; j < ent.parameter.length; j++) {
       var prm = ent.parameter[j];    
       
       if (prm.key === "trackType") {
         trackType = prm.value;
       }
     } 
   } 
    
   sheet.appendRow([
     ent.name, 
     ent.type + " " + trackType.toLowerCase(),
     "", "", "", "", "",
     JSON.stringify(ent)]);
  }  
}


/**
 * Читает строчки с листа, изменяет имя в json-объекте 
 * и засылает сущности в GTM.
 */
function updateEntsFromSheet(sheetName) {
  var sheet = SPSHEET.getSheetByName(sheetName);
  var data = sheet.getSheetValues(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  
  // Перезаписываем имена в тэгах и отсылаем в GTM.
  for (var i = 0; i < data.length; i++) {
    var ent = JSON.parse(data[i][7]);
    
    // Берём имя из 4-й колонки, если там что-то есть.    
    if (data[i][3] !== "") {
      ent.name = data[i][3];
      TagManager.Accounts.Containers.Workspaces.Tags.update(
        ent,
        ent.path);    
    }    
  }
}


// Получате спискок соответствий и преобразует имя.
function TRFNAME(name, type, sep) {
  var prefix = RULES[type.trim()];
  var re = new RegExp("^" + prefix);
  
  if (!re.test(name)) {   
    return prefix + sep + name; 
  }  
      
}


// Находит лист по имени и обнуляет его.
function refreshList(name) {
  sheet = SPSHEET.getSheetByName(name)
  if (!!sheet) {
    sheet.clear();
  } else {
     sheet = SPSHEET.insertSheet(name);
  } 
}