console.log("from eventPage.js");
var contextMenuItem = {
  id: "passwordExt",
  title: "passwordGen",
  contexts: ["editable"],
};
chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  console.log("from context inside click");

  await chrome.tabs.sendMessage(
    tab.id,
    { action: "enterPassword" },
    function (response) {
      response.forEach(function (attribute) {
        console.log(attribute);
      });
    }
  );
});
// Reciving response from content.js
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   chrome.tabs.sendMessage(
//     tabs[0].id,
//     { action: "enterPassword" },
//     function (response) {
//       console.log("response from content.js query", response);
//       console.log("tabs Object :", tabs);

//       //   var attributeList = document.getElementById("attributeList");

//       //   response.forEach(function (attribute) {
//       //     var listItem = document.createElement("li");
//       //     listItem.textContent = attribute;
//       //     attributeList.appendChild(listItem);
//       //   });
//     }
//   );
// });
