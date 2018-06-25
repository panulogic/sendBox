/* =========================================
   Copyright 2018 Class Cloud LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

	 =========================================== */

"use strict"
  const DATA_OF_BOX   = Symbol ('DATA_OF_BOX');
  const Box      = _Box()  ;

  var SendBox  = Box;

  SendBox.v    = "0.9.0";

  var CISF;
  if (typeof module !== "undefined")
  { module.exports =  Box;
    CISF =  require('./cisf/cisf.js');
  } else
  { var { ok, not, x, fails, log, warn,  onError, Type, is, r, err, eq
        }  = CISF;
  }
if (typeof Path === undefined)
{ Path     = require ("path");
}
if (typeof Fs === undefined)
{ Fs     = require ("fs");
}
 class TimeError extends Error
 { }

function _Box ()
{ return class Box
  { constructor (previousBoxOrName, meta={ })
    { let arg         = previousBoxOrName;
      let isDATA_OF_BOX      =  arg === DATA_OF_BOX;
      if (! previousBoxOrName && ! isDATA_OF_BOX)
      { onError
        ( `new Box() called without a Box or name
           as the 1st argument.  `
        );
      }
      if (previousBoxOrName instanceof Box)
      { this._previous = previousBoxOrName;
        this._name = `Child of ${ previousBoxOrName}`;
      } else
      { this._previous = null;
        this._name = previousBoxOrName;
      }
      this._data          = [];
      this._sendHandlers    = [];
      this._followers     = [];

      this._addHandlers   = [];
      this._eHandlers   = [];
      this._meta          = meta;
      this._wasSent       = false;
      this._error         = null;
    }
new ()
{ let Box    = this.constructor;

  let b      = new Box(this);

  b._creator = this;
  return b;
}
    add (... newValues )
    { if (newValues .length > 1)
    { debugger
    }
    newValues.map
    ( nv => this._data.push (nv)
    );

      let self3 = this;
      this._addHandlers.map
      (efu =>
       { efu.call (this, ... newValues );
       }
      );
     return this;
    }
funkFromData (arrayOrObject)
{ if (arrayOrObject instanceof Array)
  { return this.funkFromArray(arrayOrObject)
  }
  if (arrayOrObject instanceof Object)
  { return this.funkFromObject(arrayOrObject)
  }
  debugger
  err
  ( `Invalid argument to send():
     ${ arrayOrObject} .
     `
  )
}
funkFromArray ($arr)
{ let self = this;
   return alternativeHandler;

   function alternativeHandler (...args)
   { for (let efunk of  $arr)
     { let v =  efunk.call(self, ...args);
        if (v !== undefined)
       { return v;
       }
     }
     debugger
     err
     (`All alternative handlers returned undefined:
       ${ $arr}
      `
     );
   }
}
funkFromObject ($specOb)
{ let self = this;
   return parallelHandler;

   function parallelHandler (...args)
   { x(Box, Function);
     let keys = Object.keys ($specOb);
     let $howManyNeeded= keys.length;

     let  myBoxResult     =  self.new();
     myBoxResult._data[0] = { };
     let $resultOb        = { };
     myBoxResult._data[0] = $resultOb;

     myBoxResult.onAdd
     ( (ob) =>
       { let p        = ob.p;
         let eResults = ob.values;

         $resultOb[p] = eResults;
         let keys = Object.keys ($resultOb);
         let howManyWeHave = keys.length;

         if ( howManyWeHave === $howManyNeeded)
         { myBoxResult._data = [myBoxResult._data[0]];
           myBoxResult.send();
         }
        }
     );

     for (let p in $specOb)
     { let f =  $specOb [p] ;
        let fResult =  f.call (self, ...args);
        let vs;
        if (fResult instanceof Array)
       { vs = fResult;
       } else
       { vs = [fResult];
       }
      if (vs[0] instanceof Box)
      { debugger
        vs[0] .onSend
        ( ... values =>
          { debugger
            myBoxResult.add ({ p: p, values: values})
          }
        );
      } else
      { myBoxResult.add ({ p: p, values:  vs});
      }
     }
     return myBoxResult;
   }
}
send (... dataArgs )
{ this._startTime =  new Date().getTime();
  if ( this.wasSent())
  { this.error
    (`Trying to send a Box more than once`
    );
  }
  let data = this._data;
  if (dataArgs.length )
  { dataArgs.map
    ( dElem =>  data.push (dElem)
     );
  }
  let Box = this.constructor;

  let self = this;
  let results =
  this._sendHandlers.map
  (([efunk, followerBox]) =>
   { let handlerResultsArray  ;
     let eFunkX = efunk

     if (typeof efunk !== "function")
     { efunk = self.funkFromData (efunk);
     }
     try
     { handlerResultsArray =  efunk (... data);
     } catch (e)
     { this.propagateError (e);
       return e;
     }
     if ( handlerResultsArray instanceof Box)
     { let resultBox = handlerResultsArray;
       resultBox.onSend
       ( (... laterResults ) =>
          followerBox.send (... laterResults)
       );
     } else
     { if (! (handlerResultsArray instanceof Array))
       { handlerResultsArray = [handlerResultsArray];
       }
       followerBox.send (... handlerResultsArray);
     }
     return handlerResultsArray;
   });

    this.wasSentIsTrue ();
    if (! this._sendHandlers.length)
    { try
      { this.notifyBoxLaneDone () ;
      } catch (e)
      { this.propagateError (e);
      }
    }
    return results;
  }
  time (ms, msg="Timeout-Error")
  { let $box  = this;

    this._timeoutMsg = msg;
    this._maxTime    = ms;

   return this;
  }
  promise ()
  { let $resolve, $reject;

    let $prom = new Promise
    ( (resolve, reject) =>
      { $resolve = resolve;
        $reject  = reject;
      }
    );

    this.onSend  (data => $resolve (data) );
    this.onError (e    => $reject  (e) );

    return $prom ;
  }
do (...args)
{ return this.onSend (...args);
}
  onSend (handlerF, ... moreHandlers)
  { if (this.wasSent())
    { let data     = this.data();
      let Box      = this.constructor;
      let extraBox = new Box (DATA_OF_BOX);
      extraBox.onSend (handlerF, ... moreHandlers);
      extraBox.send (... data);
      return this;
    }
    let followerBox  = this.new ();
    this._sendHandlers.push([handlerF, followerBox]);
    if (moreHandlers.length)
    { followerBox.onSend (... moreHandlers);
    }
    return this;
  }
    onAdd (handlerF)
    { if (typeof handlerF !== "function")
      { err
        (`onAdd() argument is not a function: 
          ${ handlerF}`
        );
      }
      this._addHandlers.push (handlerF);
    }
    notifyBoxLaneDone (  )
    { if (this._previous)
     { this._previous.notifyBoxLaneDone ();
        return this;
     }
    let start        = this._startTime;
    let maxAllowed   = this._maxTime;
    let endMs        = new Date().getTime();
    let took         = endMs - start;
    if (maxAllowed === undefined)
    { maxAllowed    = Number.MAX_SAFE_INTEGER - 9876;
    }
    if (took >  maxAllowed)
    { this.error
      ( `
send() took ${ took} ms 
which is longer than the max. 
allowed ${ maxAllowed} ms. 
Msg: ${ this._timeoutMsg} 
`     );
    }
    return this;
    }
error (e)
{ this . propagateError (e);
  return this;  
}
    propagateError (e)
    { this._error = e;

     if (this._previous)
     { this._previous.propagateError (e);
        return e;
     }
    this._eHandlers.map
    ( eh =>
      { eh.call(this, e);
      }
    );

    if (!   this._eHandlers.length)
    { err
      (`${ e}`
      );
    }
    return e;
    }
    onError (handlerF)
    { if (typeof handlerF !== "function")
      { err
        (`onErr() argument is not a function: 
          ${ handlerF}`
        );
      }
      this._eHandlers.push (handlerF);
      return this;
    }
    data ()
    { return this._data ;
    }
    meta ()
    { return this._meta;
    }
    wasSent ()
    { return this._wasSent;
    }
    wasSentIsTrue ()
    { this._wasSent = true;
      return this;
    }
    static init ()
    { return this;
    }
  }.init () ;
}