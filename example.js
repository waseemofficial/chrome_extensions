let str1 = "bag";

function access() {
  let str1 = "shows";
  console.log(str1, __proto__.call(str1));
}
access();
