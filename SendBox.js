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
  const SEND_BOX      = _Box()  ;

  var SendBox  = SEND_BOX;
  SendBox.v    = "0.9.3";

  var CISF;
  if (typeof module !== "undefined")
  { module.exports =  SEND_BOX;
    CISF =  require('./cisf/cisf.js');
  } else
  { }
  var { ok, not, x, fails, log, warn,   Type, is, r, err, eq
      }  = CISF;

if (typeof Path === undefined)
{ Path     = require ("path");
}
if (typeof Fs === undefined)
{ Fs     = require ("fs");
}
 class TimeError extends Error
 { }

function _Box ()
{ const DATA   = Symbol ('DATA');
  const META   = Symbol ('META');

  return class Box
  { constructor (previousBoxOrName, meta={ })
    { let arg          = previousBoxOrName;
      let  argWasDATA  =  previousBoxOrName === DATA;  
      if (! previousBoxOrName && ! argWasDATA)
      { onError
        ( `new Box() called without a Box or name
           as the 1st argument.  `
        );
      }
      this[DATA]            = [];
      this[META]            = { };

      if (previousBoxOrName instanceof Box)
      { this[META].previous = previousBoxOrName;
        this[META].name     = `Child of ${ previousBoxOrName}`;
      } else
      { this[META].previous = null;
        this[META].name     = previousBoxOrName;
      }
      this[META].sendHandlers  = [];
      this[META].followers     = [];
      this[META].addHandlers   = [];
      this[META].eHandlers     = [];
      this[META].meta          = meta;  
      this[META].wasSent       = false;
      this[META].error         = null;
    }
new ()
{ let Box    = this.constructor;

  let b      = new Box(this);

  b[META].creator = this;
  return b;
}
data ()
{ return this[DATA] .concat([]);
}
    add (... newValues )
    { if (newValues .length > 1)
    { debugger
    }
    newValues.map
    ( nv => this[DATA].push (nv)
    );

      let self3 = this;
      this[META].addHandlers.map
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
     myBoxResult[DATA][0] = { };
     let $resultOb        = { };
     myBoxResult[DATA][0] = $resultOb;

     myBoxResult.onAdd
     ( (ob) =>
       { let p        = ob.p;
         let eResults = ob.values;

         $resultOb[p] = eResults;
         let keys = Object.keys ($resultOb);
         let howManyWeHave = keys.length;

         if ( howManyWeHave === $howManyNeeded)
         { myBoxResult[DATA] = [myBoxResult[DATA][0]];
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
{ this[META].startTime =  new Date().getTime();
  if ( this.wasSent())
  { this.error
    (`Trying to send a Box more than once`
    );
  }
  let data = this[DATA];
  if (dataArgs.length )
  { dataArgs.map
    ( dElem =>  data.push (dElem)
     );
  }
  let Box = this.constructor;

  let self = this;
  let results =
  this[META].sendHandlers.map
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
    if (! this[META].sendHandlers.length)
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

    this[META].timeoutMsg = msg;
    this[META].maxTime    = ms;

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
      let extraBox = new Box (DATA);
      extraBox.onSend (handlerF, ... moreHandlers);
      extraBox.send (... data);
      return this;
    }
    let followerBox  = this.new ();
    this[META].sendHandlers.push([handlerF, followerBox]);
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
      this[META].addHandlers.push (handlerF);
    }
    notifyBoxLaneDone (  )
    { if (this[META].previous)
     { this[META].previous.notifyBoxLaneDone ();
        return this;
     }
    let start        = this[META].startTime;
    let maxAllowed   = this[META].maxTime;
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
Msg: ${ this[META].timeoutMsg} 
`     );
    }
    return this;
    }
error (e)
{ this . propagateError (e);
  return this;  
}
    propagateError (e)
    { this[META].error = e;

     if (this[META].previous)
     { this[META].previous.propagateError (e);
        return e;
     }
    this[META].eHandlers.map
    ( eh =>
      { eh.call(this, e);
      }
    );

    if (!   this[META].eHandlers.length)
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
      this[META].eHandlers.push (handlerF);
      return this;
    }
    data ()
    { return this[DATA] ;
    }
    meta ()
    { return this[META].meta;
    }
    wasSent ()
    { return this[META].wasSent;
    }
    wasSentIsTrue ()
    { this[META].wasSent = true;
      return this;
    }
    static init ()
    { return this;
    }
  }.init () ;
}