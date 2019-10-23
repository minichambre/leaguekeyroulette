
function scrambleChange(element) {
  let value = element.value;
  let messsage = ''
  if (value <= 33) {
    message = 'Just a sprinkle'
  }else if (value > 33 && value <= 66) {
    message = 'Maybe too much'
  }else {
    message = 'This will cramp your hands'
  }
  document.querySelector('.scrambleText').innerText = message
}
