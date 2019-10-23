// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var keybinds = {
  evtUseItem1: {
    old: '',
    new: '',
    friendlyName: 'Item 1'
  },
  evtUseItem2: {
    old: '',
    new: '',
    friendlyName: 'Item 2'
  },
  evtUseItem3: {
    old: '',
    new: '',
    friendlyName: 'Item 3'
  },
  evtUseItem4: {
    old: '',
    new: '',
    friendlyName: 'Item 4'
  },
  evtUseItem5:{
    old: '',
    new: '',
    friendlyName: 'Item 5'
  },
  evtUseItem6: {
    old: '',
    new: '',
    friendlyName: 'Item 6'
  },
  evtUseItem7: {
    old: '',
    new: '',
    friendlyName: 'Recall'
  },
  evtUseVisionItem: {
    old: '',
    new: '',
    friendlyName: 'Ward'
  },
  evtCastSpell4: {
    old: '',
    new: '',
    friendlyName: 'Ult'
  },
  evtCastSpell3:{
    old: '',
    new: '',
    friendlyName: 'E'
  },
  evtCastSpell2:{
    old: '',
    new: '',
    friendlyName: 'W'
  },
  evtCastSpell1:{
    old: '',
    new: '',
    friendlyName: 'Q'
  },
  evtCastAvatarSpell2: {
    old: '',
    new: '',
    friendlyName: 'Summoner Spell 2'
  },
  evtCastAvatarSpell1: {
    old: '',
    new: '',
    friendlyName: 'Summoner Spell 1'
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

var desiredBinds = [
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

var smartOptions = [
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

document.querySelector('#doIt').addEventListener('click', () => {
  if (document.querySelector('#configLocation').value === ''){
    console.log('do something')
    return;
  }
  readConfig(document.querySelector('#configLocation').value);
})

function readConfig(location){
  console.log('trying to read')

  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream(location)
  });

  lineReader.on('line', function (line) {

    desiredBinds.some((name) => {
      if (line.includes(name)){
        console.log('match')
        keybinds[name].old = line.substring(line.indexOf('[')+1, line.length-1);
        desiredBinds = desiredBinds.filter(item => item !== name)
      }
    })

    smartOptions.some((name) => {
      if (line.includes(name)){
        console.log('match')
        smart[name].old = line.substring(line.indexOf('=')+1)
        smartOptions = smartOptions.filter(item => item !== name)
      }
    })
  });


  lineReader.on('close', () =>{
    // console.log(keybinds)
    // console.log(smart)
    writeToDom();
  });
}

function writeToDom() {
  let keybindContainer = document.querySelector('.keybinds');
  for (var entry in keybinds) {
    let key = keybinds[entry]
    let keybindName = document.createElement('div')
    keybindName.classList.add('keyBindName');
    keybindName.innerHTML = key.friendlyName;
    keybindContainer.append(keybindName)

    let oldKeybind = document.createElement('div')
    oldKeybind.classList.add('keyBindName');
    oldKeybind.innerHTML = key.old;
    keybindContainer.append(oldKeybind)

    let newKeybind = document.createElement('div')
    newKeybind.classList.add('keyBindName');
    newKeybind.innerHTML = key.new;
    keybindContainer.append(newKeybind)
  }
}
