window.logger = {};

var logger = (function() {
  function guid() {
    var array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return array;
  }

  /* Tab, Session, and Browser Identifiers */
  var identifiers = (function(){
    var _identifiers = {};
    
    function storedID(storage, type) {
      var id = storage.getItem(type);
      if (id === null) {
        id = _identifiers[type] || guid();
        _identifiers[type] = id;
        storage.setItem(type, id);
      }
      return id;
    }
    
    return {
      get localID () {
        return _identifiers['localID'] || storedID(localStorage, 'localID');
      },
      get sessionID () {
        return _identifiers['sessionID'] || storedID(sessionStorage, 'sessionID');
      },
      get windowID () {
        _identifiers['tabID'] = _identifiers['tabID'] || guid();
        return _identifiers['tabID'];
      }
    };
  })();
  
  function log(name, obj) {
    if(!(obj instanceof Object))
      obj = {};
    obj.CPO_eventName  = name;
    obj.CPO_eventTime  = Date.now();
    obj.CPO_windowID   = identifiers.windowID;
    obj.CPO_localID    = identifiers.localID;
    obj.CPO_sessionID  = identifiers.sessionID;
    console.log('logger.log', obj);
  }
  
  return {
    guid  : guid,
    log   : log
  };
})();

CodeMirror.defineOption('logging', false, 
  function (cm, new_value) {
    if (new_value != true)
      return;
    cm.on("change", function(cm, change) {
      logger.log('cm_change', change);
    });
    cm.on("focus", function(cm) {
      logger.log('cm_focus');
    });
    cm.on("blur", function(cm) {
      logger.log('cm_blur');
    });
  });

// Log the loading of the logger (near the begining of page load)  
logger.log('load');

// Log page unload
window.addEventListener('unload', function(event) {
  logger.log('unload');
});

// Log tab/window visibility change (kinda unreliable)
document.addEventListener("visibilitychange", function() {
  console.log( document.visibilityState );
});

