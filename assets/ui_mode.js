Game.UIMode = {};

Game.UIMode.gameStart = {
  enter: function () {
    console.log("Game.UIMode.gameStart enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameStart exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gameStart handleInput");
    Game.switchUIMode(Game.UIMode.gamePersistence);
  },
  renderOnMain: function (display) {
    display.clear();
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(4,4, "Welcome to WSRL", fg, bg);
    display.drawText(4, 6, "Press any key to continue", fg, bg);
    console.log("Game.UIMode.gameStart renderOnMain");
  }
};

Game.UIMode.gamePlay = {
  attr: {
    _mapId: '',
    _cameraX: 84,
    _cameraY: 84,
    _avatarId: '',
    _enemyId: ''
  },
  JSON_KEY: 'uiMode_gamePlay',
  enter: function () {
    console.log("Game.UIMode.gamePlay enter");
    Game.Message.clearMessages();
    if(this.attr._avatarId) {
      this.setCameraToAvatar();
    }
    console.dir(JSON.parse(JSON.stringify(this.getMap())));
    Game.TimeEngine.unlock();
    Game.refresh();
  },
  exit: function () {
    console.log("Game.UIMode.gamePlay exit");
    Game.TimeEngine.lock();
  },
  getMap: function () {
    return Game.DATASTORE.MAP[this.attr._mapId];
  },
  setMap: function (m) {
    this.attr._mapId = m.getId();
  },
  getAvatar: function () {
    return Game.DATASTORE.ENTITY[this.attr._avatarId];
  },
  setAvatar: function (a) {
    this.attr._avatarId = a.getId();
  },
  getEnemy: function () {
    return Game.DATASTORE.ENTITY[this.attr._enemyId];
  },
  setEnemy:function (e) {
    this.attr._enemyId = e.getId();
  },
  handleInput: function (eventType, evt) {
    var pressedKey = String.fromCharCode(evt.charCode);
    Game.Message.sendMessage("you pressed the '"+String.fromCharCode(evt.charCode)+"' key");
    console.log("Game.UIMode.gamePlay handleInput");
    if(eventType == 'keypress'){
      if (evt.keyCode == 13) {
        Game.switchUIMode(Game.UIMode.gameWin);
        return;
      } else if (pressedKey == '1') {
        this.moveAvatar(-1,1);
      } else if (pressedKey == '2') {
        this.moveAvatar(0,1);
      } else if (pressedKey == '3') {
        this.moveAvatar(1,1);
      } else if (pressedKey == '4') {
        this.moveAvatar(-1,0);
      } else if (pressedKey == '5') {
        // do nothing / stay still
      } else if (pressedKey == '6') {
        this.moveAvatar(1,0);
      } else if (pressedKey == '7') {
        this.moveAvatar(-1,-1);
      } else if (pressedKey == '8') {
        this.moveAvatar(0,-1);
      } else if (pressedKey == '9') {
        this.moveAvatar(1,-1);
      }
    }
    if(eventType == 'keydown') {
      if (evt.keyCode == 27) {
        Game.switchUIMode(Game.UIMode.gameLose);
      } else if (evt.keyCode == 187) { // '='
        Game.switchUIMode(Game.UIMode.gamePersistence);
      }
    }
  },
  renderOnMain: function (display) {
    display.clear();
    display.setOptions({
        layout: "tile",
        bg: "transparent",
        tileWidth: 14,
        tileHeight: 14,
        tileSet: Game.tileSet,
        tileMap: {
            "@": [129, 43],
            "#": [0, 14],
            "+": [14, 0],
            "%": [143,43],
            " ": [14, 14],
            "b": [0, 0],
            "c": [0, 172],
            "d": [14, 129],
            "e": [115, 0],
            "f": [158, 0],
            "g": [186, 0],
            "h": [200, 0],
            "i": [215, 0],
            "j": [229, 0],
            "k": [85, 29],
            "l": [115, 172],
            "m": [158, 172],
            "n": [186, 172],
            "o": [200, 172],
            "p": [215, 172],
            "q": [229, 172],
            "r": [85, 200],
            "s": [115, 86],
            "t": [158, 86],
            "u": [186, 86],
            "v": [200, 86],
            "w": [215, 86],
            "x": [229, 86],
            "y": [85, 115],
            "1": [486, 0],
            "2": [472, 0],
            "3": [458, 0],
            "4": [486, 14],
            "5": [486, 28],
            "6": [486, 42]
        }, width: 57, height: 26});
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    this.getMap().renderOn(display, this.attr._cameraX, this.attr._cameraY);
    console.log("Game.UIMode.gamePlay renderOnMain");
  },
  renderOnAvatar: function(display) {
    var fg = Game.UIMode.DEFAULT_COLOR_FG;
    var bg = Game.UIMode.DEFAULT_COLOR_BG;
    display.drawText(1,2,"Avatar X: "+this.getAvatar().getX(),fg,bg); // DEV
    display.drawText(1,3,"Avatar Y: "+this.getAvatar().getY(),fg,bg);
    display.drawText(1,4,"Turns taken: "+this.getAvatar().getTurns(),fg,bg);
  },
  moveAvatar: function (dx, dy) {
    if (this.getAvatar().tryWalk(this.getMap(),dx,dy)) {
      this.setCameraToAvatar();
    }
  },
  moveCamera: function (dx,dy) {
  this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },
  setCamera: function (sx,sy) {
    //TODO: Swap 13 with an attribute
    this.attr._cameraX = Math.max(0,sx - (sx % 13)) + 7;
    this.attr._cameraY = Math.max(0,sy - (sy % 13)) + 7;
    Game.refresh();
  },
  setCameraToAvatar: function () {
    this.setCamera(this.getAvatar().getX(),this.getAvatar().getY());
  },
  setupNewGame: function (restorationData) {
  this.setMap(new Game.Map('spaceship1'));
  this.setAvatar(Game.EntityGenerator.create('avatar'));
  this.setEnemy(Game.EntityGenerator.create('enemy'));

  this.getMap().addEntity(this.getAvatar(), this.getMap().getRandomWalkableLocation());
  this.getMap().addEntity(this.getEnemy(), this.getMap().getRandomWalkableLocation());
  this.setCameraToAvatar();

  // TODO: delete dev code
  for(var ecount = 0; ecount < 80; ecount++) {
    this.getMap().addEntity(Game.EntityGenerator.create('slime'),this.getMap().getRandomWalkableLocation());
  }

  Game.Scheduler.add(this.getEnemy(),true, 0.1);
  Game.Scheduler.add(this.getAvatar(),true,1);
  Game.Scheduler._queue._time = 1;

},

toJSON: function() {
  return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
},
fromJSON: function (json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this,json);
}
};

Game.UIMode.gameLose = {
  enter: function () {
    console.log("Game.UIMode.gameLose enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameLose exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gameLose handleInput");
  },
  renderOnMain: function (display) {
    display.clear();
    display.drawText(4,4, "Defeat");
    console.log("Game.UIMode.gamePlay renderOnMain");

  },

};

Game.UIMode.gameWin = {
  enter: function () {
    console.log("Game.UIMode.gameWin enter");
  },
  exit: function () {
    console.log("Game.UIMode.gameWin exit");
  },
  handleInput: function (eventType, evt) {
    console.log("Game.UIMode.gameWin handleInput");
  },
  renderOnMain: function (display) {
    display.clear();
    display.drawText(4,4, "Victory");
    console.log("Game.UIMode.gamePlay renderOnMain");

  }
};

Game.UIMode.gamePersistence = {
  RANDOM_SEED_KEY: 'gameRandomSeed',
   enter: function () {
     console.log('game persistence');
   },
   exit: function () {
   },
   renderOnMain: function (display) {
     var fg = Game.UIMode.DEFAULT_COLOR_FG;
     var bg = Game.UIMode.DEFAULT_COLOR_BG;
     display.clear();
     display.setOptions({bg: "#000", tileWidth: 14, tileHeight: 14, tileMap: {}, tileSet: null, layout: "rect",width: 80, height: 24});
     display.drawText(1,3,"press S to save the current game, L to load the saved game, or N start a new one",fg,bg);
  //   console.log('TODO: check whether local storage has a game before offering restore');
  //   console.log('TODO: check whether a game is in progress before offering restore');
   },
   handleInput: function (inputType,inputData) {
  //  console.log('gameStart inputType:');
  //  console.dir(inputType);
  //  console.log('gameStart inputData:');
  //  console.dir(inputData);
    var inputChar = String.fromCharCode(inputData.charCode);
    if (inputChar == 'S' || inputChar == 's') { // ignore the various modding keys - control, shift, etc.
      this.saveGame();
    } else if (inputChar == 'L' || inputChar == 'l') {
      this.restoreGame();
    } else if (inputChar == 'N' || inputChar == 'n') {
      this.newGame();
      console.log(Game.DISPLAYS.main.o.getOptions());
    }
  },

  saveGame: function () {
    console.log("save");
    if (Game.UIMode.gamePlay.getMap() !== null) {
      if (this.localStorageAvailable()) {
        Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
        window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
        Game.switchUIMode(Game.UIMode.gamePlay);
      }
    }
  },

  restoreGame: function () {
    console.log("restore");
    if (this.localStorageAvailable()) {
      Game.initializeTimingEngine();
      var  json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
      setTimeout(function(){
        var state_data = JSON.parse(json_state_data);
        console.log('state data: ');
        console.dir(state_data);

        console.log(Game.UIMode.gamePersistence.RANDOM_SEED_KEY);
        // game level stuff
        Game.setRandomSeed(state_data[Game.UIMode.gamePersistence.RANDOM_SEED_KEY]);

        // maps
        for (var mapId in state_data.MAP) {
          if (state_data.MAP.hasOwnProperty(mapId)) {
            var mapAttr = JSON.parse(state_data.MAP[mapId]);
            console.log("restoring map "+mapId+" with attributes:");
            console.dir(JSON.parse(JSON.stringify(mapAttr)));
            Game.DATASTORE.MAP[mapId] = new Game.Map(mapAttr._mapTileSetName);
            //Game.DATASTORE.MAP[mapId].attr = mapAttr;
            Game.DATASTORE.MAP[mapId].fromJSON(state_data.MAP[mapId]);
          }
        }

        // entities
        for (var entityId in state_data.ENTITY) {
          if (state_data.ENTITY.hasOwnProperty(entityId)) {
            var entAttr = JSON.parse(state_data.ENTITY[entityId]);
            Game.DATASTORE.ENTITY[entityId] = Game.EntityGenerator.create(entAttr._generator_template_key);
            //Game.DATASTORE.ENTITY[entityId].attr = entAttr;
            Game.DATASTORE.ENTITY[entityId].fromJSON(state_data.ENTITY[entityId]);
          }
        }

        // game play
        Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;

        Game.switchUIMode(Game.UIMode.gamePlay);
      },1);
    }
  },

  newGame: function () {
    Game.initializeTimingEngine();
    console.log("newGame");
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform()*100000));
    Game.UIMode.gamePlay.setupNewGame();
    Game.switchUIMode(Game.UIMode.gamePlay);
  },

  localStorageAvailable: function () { // NOTE: see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
     	try {
     		var x = '__storage_test__';
     		window.localStorage.setItem(x, x);
     		window.localStorage.removeItem(x);
     		return true;
     	}
     	catch(e) {
         Game.Message.send('Sorry, no local data storage is available for this browser');
     		return false;
     	}
  },
  BASE_toJSON: function(state_hash_name) {
    var state = this.attr;
    if (state_hash_name) {
      state = this[state_hash_name];
    }
    var json = JSON.stringify(state);
      return json;
  },
  BASE_fromJSON: function (json,state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    this[using_state_hash] = JSON.parse(json);
  }
};
