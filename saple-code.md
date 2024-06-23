```js
window.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");
});
```
# code 
```js
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");
  var loginFields = document.querySelectorAll(
    'input[type="text"], input[type="password"]'
  );
  for (var i = 0; i < loginFields.length; i++) {
    var field = loginFields[i];
    console.log("Field name:", field.name);
    console.log("Field type:", field.type);
    console.log("Field value:", field.value);
    console.log("------------------------");
  }
});


```
## indexedDB
```js
// Background script

// Import the indexedDB API
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

// Open a connection to the IndexedDB database
const request = indexedDB.open('myDatabase', 1);

// Event listener for the onupgradeneeded event
request.onupgradeneeded = function(event) {
  const db = event.target.result;

  // Create an object store
  const objectStore = db.createObjectStore('myObjectStore', { keyPath: 'id', autoIncrement: true  });

  // Create an index
  objectStore.createIndex('nameIndex', 'name', { unique: false });
};

// Event listener for the onsuccess event
request.onsuccess = function(event) {
  console.log('IndexedDB database created successfully');
};

// Event listener for the onerror event
request.onerror = function(event) {
  console.error('Error creating IndexedDB database:', event.target.error);
};

// Background script

chrome.runtime.onInstalled.addListener(function() {
  // Code to create the IndexedDB database
});
// manifest.json
{
  "name": "My extension",
  "permissions": [
    "storage",
    "unlimitedStorage"
  ],
  ...
}

```



## mutable

```js
const observer = new MutationObserver(function (mutationsList, observer) {
  // Iterate over each mutation in the list
  for (let mutation of mutationsList) {
    // Check if nodes were added to the DOM
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      // Iterate over the added nodes
      mutation.addedNodes.forEach(function (node) {
        // Check if the node is an input field and is a login field
        if (
          node.nodeName === "INPUT" &&
          (node.type === "text" || node.type === "password")
        ) {
          console.log("Login field found:", node);
          // Perform any additional logic or actions here
        }
      });
    }
  }
});

// Start observing changes in the document body
observer.observe(document.body, { childList: true, subtree: true });

```

>Document ready
>```js 
>window.onload = function() {
>    alert('Ready');
>    //Send a message
>    sendMessage();
>}
>//Get message from background page
>chrome.runtime.onMessage.addListener (function(request, sender, sendResponse) {
>    //Alert the message
>    alert("The message from the background page: " + request.greeting);
>//You have to choose which part of the response you want to display ie. request.greeting
>    //Construct & send a response
>    sendResponse({
>        response: "Message received"
>    });
>});
>//Send message to background page
>function sendMessage() {
>    //Construct & send message
>    chrome.runtime.sendMessage({
>        method: "postList",
>        post_list: "ThePostList"
>    }, function(response) {
>        //Alert the message
>        alert("The response from the background page: " + response.response);
>//You have to choose which part of the response you want to display ie. response.response
>    });
>}```

