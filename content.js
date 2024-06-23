chrome.runtime.onMessage.addListener(gotMessage);
function gotMessage(message, sender, sendResponse) {
  console.log("message :", message, "sender :", sender);
  if (message.action === "enterPassword") {
    var inputElement = document.activeElement;
    var attributes = Array.from(inputElement.attributes);

    var attributeList = attributes.map(function (attr) {
      return attr.name + ": " + attr.value;
    });
  }
  sendResponse(attributeList);
}
