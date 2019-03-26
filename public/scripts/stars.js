/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
var count;
function starmark(item) {
  var i = 0;
  count = item.id[0];
  sessionStorage.starRating = count;
  const subid = item.id.substring(1);
  for (i = 0; i < 5; i++) {
    if (i < count) {
      document.getElementById(i + 1 + subid).style.color = 'orange';
    } else {
      document.getElementById(i + 1 + subid).style.color = 'black';
    }
  }
}

function result() {
  if (count) document.getElementById('rating').value = count;
}
