
const fs = require('fs')
const dialog = require('electron').remote.dialog

var scrambleSetting = 2;
var keybinds = {
  evtUseItem1: {
    friendlyName: 'Item 1'
  },
  evtUseItem2: {
    friendlyName: 'Item 2'
  },
  evtUseItem3: {
    friendlyName: 'Item 3'
  },
  evtUseItem4: {
    friendlyName: 'Item 4'
  },
  evtUseItem5:{
    friendlyName: 'Item 5'
  },
  evtUseItem6: {
    friendlyName: 'Item 6'
  },
  evtUseItem7: {
    friendlyName: 'Recall'
  },
  evtUseVisionItem: {
    friendlyName: 'Ward',
  },
  evtCastSpell4: {
    friendlyName: 'Ult',
  },
  evtCastSpell3:{
    friendlyName: 'E',
  },
  evtCastSpell2:{
    friendlyName: 'W',
  },
  evtCastSpell1:{
    friendlyName: 'Q',
  },
  evtCastAvatarSpell2: {
    friendlyName: 'Summoner Spell 2',
  },
  evtCastAvatarSpell1: {
    friendlyName: 'Summoner Spell 1',
  }
};




//When they browse to a file path
document.querySelector('.browseFile').addEventListener('click', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }).then(result => {
    //Set the file path to the input value
    document.querySelector('#configLocation').value = result.filePaths
  }).catch(err => {
    //Error getting the file path
    console.log(err)
  })
});

//When they press the scramble button, setting things in motion
document.querySelector('#doIt').addEventListener('click', function() {

  //Start by verifying the config file string isnt null
  let configInput =document.querySelector('#configLocation');
  configInput.classList.remove('invalidConfig');
  if (configInput.value === ''){
    configInput.classList.add('invalidConfig')
    return;
  }

  //Set the error messages to disappear
  document.querySelector('.keybinds').classList.remove('showKeybinds')
  document.querySelector('.titles').classList.remove('showKeybinds');

  //These are the keybinds we're looking for
  let desiredBinds = [
    'evtUseItem1',
    'evtUseItem2',
    'evtUseItem3',
    'evtUseItem4',
    'evtUseItem5',
    'evtUseItem6',
    'evtUseItem7',
    'evtUseVisionItem',
    'evtCastSpell4',
    'evtCastSpell3',
    'evtCastSpell2',
    'evtCastSpell1',
    'evtCastAvatarSpell2',
    'evtCastAvatarSpell1'
  ]

  //Start reading the config file, by supplying the file location and the binds we're looking for
  readConfig(document.querySelector('#configLocation').value, desiredBinds);
})


//reads config file and checks for existence of expected values
function readConfig(location, desiredBinds){

  //setup needed vars for checking/saving data
  let settingsFileJson = "";
  let totalNeeded = desiredBinds.length;

  try {
    //is the file real?
    if (fs.existsSync(location)) {
      //file exists, store it in memory
      settingsFileJson = require(location)
    }
  } catch(err) {
    //There was either an error with the files insides, or a permission error opening it. ABORT.
    console.log(err)
    document.querySelector('#configLocation').classList.add('invalidConfig');
    return;
  }

  //The league config is a dangerous place. The input.ini is nested deep within arrays of arrays. Lets hope Riot doesn't change this often.
  //TODO: Secure a better way of reliably getting to this location
  let input = settingsFileJson.files[1].sections[0].settings;
  let found = 0;

  //Go through each keybind we're looking for by 'name'
  desiredBinds.some((name) => {
    let index = 0;
    //Input is the input.ini object inside the config file
    for (key in input) {
      if (input[key].name.includes(name)) {
        //Found a match for a setting

        //Increment the number of settings found
        found++;

        //Remember the old keybind value so we can show it to screen later
        keybinds[name].old = input[key].value;

        //Also store where this keybind is in the array, it'll save us traversing this path again later to write the new keybind
        keybinds[name].arrayIndex = index;

        //Remove this keybind from the array of ones to find, we dont want to find it again
        desiredBinds = desiredBinds.filter(item => item !== name)
      }

      index++;
    }
  })


  if (found != totalNeeded) {
    //For some reason, we couldn't find all the keybindings we were expecting to.
    //Abort, somethings wrong with their config file.
    document.querySelector('#configLocation').classList.add('invalidConfig');
    return;
  }

  //All good, lets start making some new keybindings
  generateBindings(location, settingsFileJson)

  //Keybinds made and stored in a global object,
  //Lets show the user their new keybindings
  writeToDom();
}

function generateBindings(location, settingsFileJson) {
  for (var entry in keybinds){
    keybinds[entry].new = makeBind()
  }
  writeBindings(location, settingsFileJson);
}



function makeBind() {
  let useModifiers = false;
  let useMultipleModifiers = false;

  if (scrambleSetting > 1){
    useModifiers = true;
  }
  if (scrambleSetting > 2){
    useMultipleModifiers = true;
  }

  let randomKeybind = "";

  if (useModifiers) {
    randomKeybind = modifiers[getRandomInt(0,modifiers.length-1)]
  }

  if (useMultipleModifiers) {
    let newModifier = modifiers[getRandomInt(0,modifiers.length-1)]

    //We need to prevent a situation where a keybind is [ctrl][ctrl][q] for example. We don't want the same
    //modifier appearing twice. So this while loop prevents that
    while (randomKeybind == newModifier) {
      newModifier = "";
      newModifier = modifiers[getRandomInt(0,modifiers.length-1)];
    }
    randomKeybind += newModifier;
  }

  //Sets a keybind to a number about 26% of the time, and a letter 74% of the time.
  if (getRandomInt(0,100) > 74){
    randomKeybind += "[" + getRandomInt(0,9) + "]";
  } else {
    randomKeybind += "[" + String.fromCharCode(97+Math.floor(Math.random() * 26)) + "]";
  }

  return randomKeybind
}

function writeBindings(location,settingsFileJson) {
  for (let entry in keybinds) {
    //Now write the new keybinding to the config file, same location as where we found it
    settingsFileJson.files[1].sections[0].settings[keybinds[entry].arrayIndex].value = keybinds[entry].new;
  }

  //Conver the object back to json and write it in the same location
  let newJson = JSON.stringify(settingsFileJson);
  fs.writeFile(location, newJson, 'utf8', (err) => {
    console.log(err);
  });
}


function writeToDom() {
  //Boring javascript for creating divs and shoving them in the DOM with the correct classes.
  //These show the keybindings, old and new, to the user
  let keybindContainer = document.querySelector('.keybinds');
  keybindContainer.innerHTML = ""
  for (var entry in keybinds) {
    
    //Each object entry has:
    //friendlyName - the actual name of the keybind
    //old - the old keybind
    //new - the new keybind we just made
    let key = keybinds[entry]

    //create div for the friendly name
    let keybindName = document.createElement('div')
    keybindName.classList.add('keyBindName','keyCell');
    keybindName.innerHTML = key.friendlyName;
    keybindContainer.append(keybindName)

    //create div for the old keybind
    let oldKeybind = document.createElement('div')
    oldKeybind.classList.add('keyBindName','keyCell');
    oldKeybind.innerHTML = key.old;
    keybindContainer.append(oldKeybind)


    //create div for the new keybind
    let newKeybind = document.createElement('div')
    newKeybind.classList.add('keyBindName','keyCell');
    newKeybind.innerHTML = key.new;
    keybindContainer.append(newKeybind)
  }

  //Now everythings added, add a class which makes this part of the dom visible.
  keybindContainer.classList.add('showKeybinds')
  document.querySelector('.titles').classList.add('showKeybinds');
}

//When they change the slider, update a global variable
function scrambleChange(element) {
  let value = element.value;
  let messsage = ''
  if (value <= 33) {
    message = 'Just a sprinkle'
    scrambleSetting = 1;
  }else if (value > 33 && value <= 66) {
    message = 'Maybe too much'
    scrambleSetting = 2;
  }else {
    message = 'This will cramp your hands'
    scrambleSetting = 3;
  }
  document.querySelector('.scrambleText').innerText = message
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var modifiers = [
  '[Ctrl]',
  '[Alt]',
  '[Shift]',
  '[Tab]',
  '[Return]',
  '[Space]'
];
