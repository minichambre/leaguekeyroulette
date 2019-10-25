// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const fs = require('fs')
var scrambleSetting = 2;
var fileAsArray = [];
var keybinds = {
  evtUseItem1: {
    old: '',
    new: '',
    friendlyName: 'Item 1',
    arrayIndex: 0
  },
  evtUseItem2: {
    old: '',
    new: '',
    friendlyName: 'Item 2',
    arrayIndex: 0
  },
  evtUseItem3: {
    old: '',
    new: '',
    friendlyName: 'Item 3',
    arrayIndex: 0
  },
  evtUseItem4: {
    old: '',
    new: '',
    friendlyName: 'Item 4',
    arrayIndex: 0
  },
  evtUseItem5:{
    old: '',
    new: '',
    friendlyName: 'Item 5',
    arrayIndex: 0
  },
  evtUseItem6: {
    old: '',
    new: '',
    friendlyName: 'Item 6',
    arrayIndex: 0
  },
  evtUseItem7: {
    old: '',
    new: '',
    friendlyName: 'Recall',
    arrayIndex: 0
  },
  evtUseVisionItem: {
    old: '',
    new: '',
    friendlyName: 'Ward',
    arrayIndex: 0
  },
  evtCastSpell4: {
    old: '',
    new: '',
    friendlyName: 'Ult',
    arrayIndex: 0
  },
  evtCastSpell3:{
    old: '',
    new: '',
    friendlyName: 'E',
    arrayIndex: 0
  },
  evtCastSpell2:{
    old: '',
    new: '',
    friendlyName: 'W',
    arrayIndex: 0
  },
  evtCastSpell1:{
    old: '',
    new: '',
    friendlyName: 'Q',
    arrayIndex: 0
  },
  evtCastAvatarSpell2: {
    old: '',
    new: '',
    friendlyName: 'Summoner Spell 2',
    arrayIndex: 0
  },
  evtCastAvatarSpell1: {
    old: '',
    new: '',
    friendlyName: 'Summoner Spell 1',
    arrayIndex: 0
  }
};

var smart = {
  evtUseVisionItemsmart: {
    old: '',
    new: ''
  },
  evtUseItem6smart: {
    old: '',
    new: ''
  },
  evtUseItem5smart: {
    old: '',
    new: ''
  },
  evtUseItem4smart: {
    old: '',
    new: ''
  },
  evtUseItem3smart: {
    old: '',
    new: ''
  },
  evtUseItem2smart: {
    old: '',
    new: ''
  },
  evtUseItem1smart: {
    old: '',
    new: ''
  },
  evtCastSpell4smart: {
    old: '',
    new: ''
  },
  evtCastSpell3smart: {
    old: '',
    new: ''
  },
  evtCastSpell2smart: {
    old: '',
    new: ''
  },
  evtCastSpell1smart: {
    old: '',
    new: ''
  },
  evtCastAvatarSpell2smart: {
    old: '',
    new: ''
  },
  evtCastAvatarSpell1smart: {
    old: '',
    new: ''
  }
}


const dialog = require('electron').remote.dialog

document.querySelector('.browseFile').addEventListener('click', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }).then(result => {
    console.log(result.filePaths)
    document.querySelector('#configLocation').value = result.filePaths
  }).catch(err => {
    console.log(err)
  })
});

document.querySelector('#doIt').addEventListener('click', function() {
  let configInput =document.querySelector('#configLocation');
  configInput.classList.remove('invalidConfig');
  if (configInput.value === ''){
    configInput.classList.add('invalidConfig')
    return;
  }

  document.querySelector('.keybinds').classList.remove('showKeybinds')
  document.querySelector('.titles').classList.remove('showKeybinds');


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

  let smartOptions = [
    'evtUseVisionItemsmart',
    'evtUseItem6smart',
    'evtUseItem5smart',
    'evtUseItem4smart',
    'evtUseItem3smart',
    'evtUseItem2smart',
    'evtUseItem1smart',
    'evtCastSpell4smart',
    'evtCastSpell3smart',
    'evtCastSpell2smart',
    'evtCastSpell1smart',
    'evtCastAvatarSpell2smart',
    'evtCastAvatarSpell1smart'
  ]
  readConfig(document.querySelector('#configLocation').value, desiredBinds, smartOptions);
})

function readConfig(location, desiredBinds, smartOptions){
  let settingsFileJson = "";
  let totalNeeded = desiredBinds.length;
  let errorReading = false;
  try {
    if (fs.existsSync(location)) {
      //file exists
      settingsFileJson = require(location)
    }
  } catch(err) {
    console.log(err)
    document.querySelector('#configLocation').classList.add('invalidConfig');
    return;
  }

  console.log(settingsFileJson)

  let input = settingsFileJson.files[1].sections[0].settings;
  let found = 0;
  desiredBinds.some((name) => {
    let index = 0;
    for (key in input) {
      if (input[key].name.includes(name)) {
        found++;
        keybinds[name].old = input[key].value;
        keybinds[name].arrayIndex = index;
        desiredBinds = desiredBinds.filter(item => item !== name)
      }
      index++;
    }
  })

  if (found != totalNeeded) {
    document.querySelector('#configLocation').classList.add('invalidConfig');
    return;
  }
  console.log(keybinds);

  generateBindings(location, settingsFileJson)
  console.log(keybinds);
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
    while (randomKeybind == newModifier) {
      newModifier = "";
      newModifier = modifiers[getRandomInt(0,modifiers.length-1)];
    }
    randomKeybind += newModifier;
  }

  if (getRandomInt(0,100) > 74){
    randomKeybind += "[" + getRandomInt(0,9) + "]";
  } else {
    randomKeybind += "[" + String.fromCharCode(97+Math.floor(Math.random() * 26)) + "]";
  }

  return randomKeybind
}

function writeBindings(location,settingsFileJson) {
  for (let entry in keybinds) {
    settingsFileJson.files[1].sections[0].settings[keybinds[entry].arrayIndex].value = keybinds[entry].new;
  }
  let newJson = JSON.stringify(settingsFileJson);
  fs.writeFile(location, newJson, 'utf8', (err) => {
    console.log(err);
  });
  // const fs = require('fs');
  // const writeStream = fs.createWriteStream(location);
  // const pathName = writeStream.path;
  //
  // // write each value of the array on the file breaking line
  // fileAsArray.forEach(value => writeStream.write(`${value}\n`));
  //
  // // the finish event is emitted when all data has been flushed from the stream
  // writeStream.on('finish', () => {
  //    console.log(`wrote all the array data to file ${pathName}`);
  // });
  //
  // // handle the errors on the write process
  // writeStream.on('error', (err) => {
  //     console.error(`There is an error writing the file ${pathName} => ${err}`)
  // });
  //
  // // close the stream
}

function writeToDom() {
  let keybindContainer = document.querySelector('.keybinds');
  keybindContainer.innerHTML = ""
  for (var entry in keybinds) {
    let key = keybinds[entry]
    let keybindName = document.createElement('div')
    keybindName.classList.add('keyBindName','keyCell');
    keybindName.innerHTML = key.friendlyName;
    keybindContainer.append(keybindName)

    let oldKeybind = document.createElement('div')
    oldKeybind.classList.add('keyBindName','keyCell');
    oldKeybind.innerHTML = key.old;
    keybindContainer.append(oldKeybind)

    let newKeybind = document.createElement('div')
    newKeybind.classList.add('keyBindName','keyCell');
    newKeybind.innerHTML = key.new;
    keybindContainer.append(newKeybind)
  }
  keybindContainer.classList.add('showKeybinds')
  document.querySelector('.titles').classList.add('showKeybinds');
}

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
