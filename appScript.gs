var wbook = SpreadsheetApp.openByUrl("YOUR_LINK_TO_GOOGLE_SHEET");
var sheet = wbook.getSheetByName("Schedule");

function doGet(e){
  var action = e.parameter.action;
  var date = e.parameter.date;

  if (action == "getData") {
    return getData(date);
  }
}

function getData(date){
  var rows = sheet.getRange(2,1,sheet.getLastRow()-1, sheet.getLastColumn()).getDisplayValues();
  var data = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var sheetDate = row[0];

    if (sheetDate == date){
      var record = {};
      record["Date"] = row[0];
      record["Location"] = row[1];
      record["Start"] = row[2];
      record["End"] = row[3];
      record["BookedBy"] = row[4];
      record["Tags"] = row[5] ? row[5] : "";
      data.push(record);
    }
  }

  if (data.length === 0) {
    return ContentService.createTextOutput("There is no sauna today :(").setMimeType(ContentService.MimeType.TEXT);
  } else {
    var result = JSON.stringify(data);
    return ContentService.createTextOutput(result).setMimeType(ContentService.MimeType.JSON);
  }
}
