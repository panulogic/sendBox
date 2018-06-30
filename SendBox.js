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

/** HOW TO USE THIS:

A caller of a possibly async functon gets back
an instance of SensBox as result. The results
are inside the box either already or later.

The caller adds onSent(handler) to the box.
This m,easn the handler function gets called
with results immediately if  'send' -method
of the box had already been called, or it not
then then the handler will be called when
send() is called on the box.

The caller does not know whether the called
function really is async or not, only that
it returns a box.

The "server function" can construct the box
by giving it an add-handler so when it loops
arounf some function calls it can pass the
box to them and they will add theriu data
to it. After loop is over it can call send
on the box meaning it is ready to be received.
OR it can make the addHandler call send()
when enough data is in the box.

BUt THE OTHER WAY of using Box is that the
caller passes the box in as parameter.
Then it does not need to be returned.
But when the answer is ready often asyncly
the caller gets its handlers triggered.

But since we expect there to be more than
one caller of any reusable function it is
typically better that the called function
creates the box and returns it, so the
caller does not need to.

The caller may or may not need the result.
If it does not care then the call becomes
very simple. Yet it has the OPTION of
getting results. Say you onSend a build and
the caller MAY be interested in a report.
But maybe not if the called function
is MOSTLY for side-effects like doing
a build.
*/

  const SEND_BOX      = _Box()  ;  // for the browsers, create a global

  var SendBox  = SEND_BOX;
  SendBox.v    = "0.9.9";

  var CISF;
	if (typeof module !== "undefined")  // in the browser it is undefined
	{ module.exports =  SEND_BOX;
	 // CISF =  require('./cisf/cisf.js');
	  if (typeof Path === undefined)
	  { Path = require ("path");
	  }
	  if (typeof Fs === undefined)
	  { Fs = require("fs");
	  }

	} else
	{ // if on the browser the global CISF is created in CISF.js
  }

/*
Try to get by without cisf here, only use it
in the tests so it's easy to include just
sendbox.js for browser-applications.

Yes seems we were using  cisf apis in only one
line here in // x (Box, Function);

  var { ok, not, x, fails, log, warn, Type, is, r, err, eq
      }  = CISF;
*/

function  log (s)
{ console.log(s);
}

	function w (anArray)
	{ return (
		{ last() {return anArray[anArray.length - 1]}
		}      )
	}


	function _Box ()
	{
		class TimeError extends Error
		{
		}
		const DATA   = Symbol ('DATA');
		const META   = Symbol ('META');
		const I      = Symbol ('I');

    const IBox = _InnerBox();

		return class Box
		{
			constructor (name, meta)
			{ this [I] = new IBox (name, meta) ;
				return this;
			}

			static fromUrl (url)
			{ let ibox    =  IBox .  fromUrl (url);
			  let newPub  = new this();
			  newPub  [I] = ibox;
			  return newPub ;
		  }

			static init ()
			{ return this;
			}

			onSend (handlerF, ... moreHandlers)
			{  this [I].onSend (handlerF, ... moreHandlers);
				 return this;
			}

			send (... dataArgs )  // you dont need to send an array y9ou send N elements
			{ return this [I].send (... dataArgs ) ;
			}

			onAdd (handlerF)
			{  this[I].onAdd (handlerF);
				 return this;
			}

			add (... newValues )
			{
			   this [I] . add (... newValues );
				 return this;

			 /* Each value is added as one element of data
					When send() is called  every element of data
					becomes an argument of its own.  What the
				  inner function does is this:

							newValues.map
							( nv => this[DATA].push (nv)
							);

				  Each element of course can be an array.
				  Arguments is easy where you have to pay
				  attention is the return values of send-
				  handlers. If that returns an array each
				  value becomes one data-element so if you
				  want to reurn juts one element which is
				  an array you muts return  [ [ ... ]]
				*/
			}

			time (ms, msg)
			{  this [I].time (ms, msg="Timeout-Error");
				 return this;
			}

			onError (handlerF)
			{
				this [I].			onError (handlerF) ;
				return this; // munbov5lrs
			}

			error (e)
			{ return this [I].		error (e);
			}

			promise ()
			{ return this [I].	promise ();
			}

			toString ()
			{ return this [I].toString () ;
			}

	}.init () ;


	function _InnerBox ()
	{
		return class InnerBox
		{
			constructor
			(previousBoxOrName, meta={})
			{
				if (previousBoxOrName === DATA)
				{ debugger
				}

				if (! previousBoxOrName || previousBoxOrName === DATA)
				{  previousBoxOrName = ( Math.random().toString(36)).split(/\./)[1];
				}
				let arg 				 = previousBoxOrName;
				this[DATA]       = [];
				this[META]       = {};

				if (previousBoxOrName instanceof InnerBox)
				{ this[META].previous = previousBoxOrName;
					this[META].name     = `CHILD of ${previousBoxOrName}`;
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

			static fromUrl (url)
			{
			if (this.runningOnNode ())
			{ return  fromUrl_node (url, this);
			}
			return fromUrl_browser (url, this);


			function fromUrl_node (url, Box)
			{ let box = new Box();
			  let $URL = url;

			  // This box is created internally so
			  // best to give it an error-handler
        // My caller will typically give it another

				box.onError        // name was x7j0ggjdw9k , one error-handler
				(  EH_of_fromUrl_node
				);


				let content = '';
				let gotData = false;

        let transport = require("http");
        if (url.match(/^https/i))
				{ transport = require("https");
				}

        try
				{ transport.get
					( url
					, responseHandler
					) .on('error', errorHandler);

				} catch (e)
				{ debugger; debugger;  // do we come here?
				  box.error(e);
				}
				return box ;

 // non-existent urls may take you to ISP's search page

function EH_of_fromUrl_node (e)
{
   let url = $URL;
   this.E_HANDLERS = this[META].eHandlers;

 	if ((e + "").match (/TIMEDOUT/i) )
	{  debugger
	}
		// seems we come here for timeout error
		// also first for the not found.
		// But how ot get the rror up?

	 log (`
EH_of_fromUrl_node() ERROR trying to 
get the url: 
${url}
${e} 
`)
}
		function responseHandler (response)
		{ response.setEncoding('utf8');
			response.on ('data', dataHandler);
			response.on ('end' , endHandler);

				 function dataHandler (d)
				 { let resp = response;
					 let u    = url;
					 gotData  = true;
					 content += d;
				}


				 function endHandler (what)
				 { let resp = response;
					 if (gotData)
					 { box.send (content);
					 }
					 // End before data often means 301 redirect
				 }
    }
    		 function errorHandler (e)
				 { // you come here if the url host does
				   // not get resolved by dns.
				   log (`ERROR for ${box}`);
				   debugger
				   box.error(e);
				 }

			}

			function fromUrl_browser (url, Box)
			{
				let box = new Box();
				let xhr = new XMLHttpRequest();
				let $xhr = xhr;
				xhr.onreadystatechange
				=
					function (evt)
					{ let xhr = $xhr;
					  let me = this;

					  if( xhr.readyState === 4 )
					  { if (xhr.status === 200 )
						  { box.send (xhr.responseText);
              } else
							 { box.error
							   (`
http.get() returned status
${xhr.status} for url
${url}.
							   `);

							 }
						}
					};
				xhr.open('GET', url);
				xhr.send();
				return box  ;
			}

		}
		// non-existent urls often take you to
		// ISP's search page


		static runningOnNode ()
		{ let ud = "undefined";

			if (typeof process === ud)
			{ return false;
			}
			if (! process )
			{ return false;
			}
			if (! process.versions )
			{ return false;
			}
			if (! process.versions.node )
			{ return false;
			}
			if (typeof __dirname === ud)
			{ return false;
			}
			if (typeof __filename === ud)
			{ return false;
			}
			if (typeof require   === ud)
			{ return false;
			}
			if (require === null)
			{ return false;
			}
			if (! require.resolve)
			{ return false;
			}
			if (typeof module    === ud)
			{ return false;
			}
			return true;
		}

			static init ()
			{
			//  testBox (this);
				return this;
			}

		onSend (handlerF, ... moreHandlers)
		{
			if (this.wasSent())
			{ let data     = this.data();
				let Box      = this.constructor;
				let extraBox = new Box ( ); // it is no longer necessary to give the cosntr4uctor an argument
				extraBox.onSend (handlerF, ... moreHandlers);
				extraBox.send (... data);
				return this;
			}
			let followerBox  = this.new ();
			followerBox[META].eHandlers = this[META].eHandlers;
			// we only call the ehandlers if there are some
			// but you can only give some to the first box
			// therefore we muts copy them to all followers.
			// This way if you dont define ehandler you
			// get errors right away which is important
			// for development to see which handler
			// actually is causing the error.

			this[META].sendHandlers.push([handlerF, followerBox]);
			if (moreHandlers.length)
			{ followerBox.onSend (... moreHandlers);
			}
			return this;
		}

	send (... dataArgs )  // you dont need to send an array y9ou send N elements
	{
		this[META].startTime =  new Date().getTime();
		if ( this.wasSent())
		{ this.error
			(`Trying to send a Box more than once`
			);
			// dont know why anybody would need to send it more than once
		}

		let data = this[DATA];
		if (dataArgs.length)
		{ dataArgs.map
			( dElem =>  data.push (dElem)
			 );
		}

		let Box = this.constructor;

		let self = this;
		let results =
		this[META].sendHandlers.map
		(([efunk, followerBox]) =>
		 {
			 let handlerResultsArray  ;
			 let eFunkX = efunk

			 if (typeof efunk !== "function")
			 { efunk = self.funkFromData (efunk);
			 }

			 if  (this[META].eHandlers.length )
			 { try
				 { handlerResultsArray =  efunk (... data);
				 } catch (e)
				 { this.propagateError (e);
					 return e; // return from map()
				 }
			 } else
			 { handlerResultsArray =  efunk (... data);
				 // If there are no error-handlers we
				 // let the error happen right away
				 // because else it is hard to see
				 // from stack which function actually
				 // caused the error. But for some internally
				 // created boxes like fromUrl() we give
				 // an error handler which shows where the
				 // error actually happened in the stack, like:
				 /*
					ReferenceError: getBoxFromUrl is not defined
					at retrieveCapitals (C:\Output\4_PRODUCE\Dev\ClassCloud\_lib\sendBox\test.js:147:13)
					*/

			 }

			 // if ( handlerResultsArray instanceof Box)
			 // teh above would not work because Box refer to my
			 // construyctor which is the inner box whereas the
			 // handler result may be created in test.js and thus
			 // may reutnr an instacne of the Public box. But since
			 // they both are defined here in the same module
			 // we can use my priovat symbols to detect if it
			 // is either one. See test-methods

if (handlerResultsArray === undefined)
{
}
			 if (     handlerResultsArray
			      && ( handlerResultsArray[DATA]
			           || handlerResultsArray[I]
			         )
			    )
			 { let resultBox = handlerResultsArray; // call a box a box
				 resultBox.onSend
				 ( (... laterResults ) =>
						followerBox.send (... laterResults)
				 );
				 // When somebody or something later calls
				 // resultBox.send(... delayedResults)
				 //  THEN the above calls
				 // followerBox.send(... delayedResults)

			 } else
			 { if (! (handlerResultsArray instanceof Array))
				 { handlerResultsArray = [handlerResultsArray];
				 }
				 followerBox.send (... handlerResultsArray);
			 }
			 return handlerResultsArray; // from map(),  may be a box
		 });

			this.wasSentIsTrue ();
			if (! this[META].sendHandlers.length)  // we are the last one one
			{ try
				{ this.notifyBoxLaneDone () ;
				} catch (e)
				{ this.propagateError (e); // can be a timeout-error
				}
			}
			return results;
		}

			add (... newValues )
			{
			// news you must now pass in each value separately
			//  because the iea is that each handler should
			// be able to count how many additions have been done.
			// YES BUT each value can consist of multiple elements

			if (newValues .length > 1)
			{ debugger
				 // we a change here do not add them
				 // as single datum you could then never add
				 // anything but arrays.
			}
			newValues.map
			( nv => this[DATA].push (nv)
			);

				let self3 = this; // below arrow-funkction can not access this'
				this[META].addHandlers.map
				(efu =>
				 {
					 // efu (... tupletFieldValues)  ;
					 efu.call (this, ... newValues );
				 }
				);
			 return this; // so you can send ti right after adding
			}

		time (ms, msg="Timeout-Error")
		{ let $box  = this;

			this[META].timeoutMsg = msg;
			this[META].maxTime    = ms;

		 return this;
		}

		promise ()
		{
			let $resolve, $reject;

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

			/**
			 * onError() sets the error-handler. It is called onError()
			 * because it can be used more generally as an alternative
			 * processing route one man's error is another man's data.
			 * Say for instance when processing an http-request if
			 * a file is not found you would not crash you would just
			 * send a 404 back.
			 *
			 * RETHINK: errors are propagated for3ards currently
			 * btu really theh SHOULD propagate backwatds  because
			 * you only can attach one error-handler to the whole
			 * pipeline which can have N onSend-handlers. So if the
			 * last onSend handler causes an error the one and only
			 * error-handler we have must still be called.
			 */
			onError (handlerF)
			{
				if (typeof handlerF !== "function")
				{ err
					(`onErr() argument is not a function: 
						${handlerF}`
					);
				}
				this[META].eHandlers.push (handlerF);
				return this;
			}


	 /*
	 This was what was happening, the first response from
	 twitter is status 301: Moved permanently and
	 resp.headers.location === "https://twitter.com/ClassCloudLLC"
	 meaning the httpS url. But then does node make
	 ahttps request then automatically?
	 If I try so start with https url I get an error.
		*/

	error (e2)
	{	let e = new Error (this + " " + e2)
	  this . propagateError (e);
		return this;
	}

	toString ()
	{  return 'SendBox-' + (this[META].name)  ;
	}

	new ()
	{ let Box    = this.constructor;

		let b      = new Box(this);
		// Box must take an argument which is either
		// an error-handler function OR an instacne of Box
		// from which it knwos to onSend this:

		b[META].creator = this; // so timeout errors can be delegated to first box
		return b;
	}



	//  result of send() is simply an array of the
	// results of my  onSend-handlers. If the result
	// is not a box we send it to follower box
	// but we dont care what that send of the follower
	// box returns. Why? because if the result is a box
	// we dont "call that box" but instead attach a handler
	// to it  so when it later beceoms ready only then
	// the result is sent to the followerbox. SO we dont know yet what
	// the send of the followerbox will return in the
	// future. WE must treat both cases similarly because
	// the handler function might dynamically decide to
	// know it has the result already or that it can only
	// return a box.  The reuslt of send() is not very
	// interesting because not only does send get called
	// async  it can also cause delayed calls to the
	// followers.  In other words send-results can
	// include futures. send() typically happens in
	// the future but also when it does it can cause
	// other actions further in the future whose results
	// are not known at the time it is called.

	// note the handlerResult is the result of the
	// handler-function atrtached to this box. That
	// handlerResult is sent to the followerbox now
	// or later if there is one. But so what MY caller
	// gets as result is whaat my handler SENT FORWARD.
	//
	// Note also that if there is a handler there
	// muts ALSO be a follower-box, because calling
	// onSend() always cxreates a follwoerbox as well.
	// So therefore we can way that the result of
	// send() is always what the "send() sent forward"
	//

				// so one way to know HOW MANY  handlers
				// there were is simply he l,ength of the rtesult.
				// Note we dont know what the follower boxes reutnred
				// if anything because they can branch out

	// if you call withou an argument ot undefined
				 // as argument then we assume all data has
				 // already been added by previous calls to add.
				 // In this sense send() is like add it only
				 // adds to the data never replaces it.

			/*
			_______________________
			we though sahould be easy to create a box
			and give the constructor some initial data
			so when everything is ready all we need to
			onSend is send.

			But  currently the rule is that  constructor muts
			be called with eiother an error handler or
			the predecessor box.. Why? That way follower
			boxes can reach the first box and pass errors
			to it and that way error handler only needs to
			be attached with the 1st box.

	NOTE: you need not add a onSend handler to a box
	because you can always add that later even
	after it has been sent. But you muts always
	add an error handler to the first box because
	it is important that you are notified if some
	action could NOT bwe performed. Think about
	sayi writing a file you dont care to fo anything
	if the file gets successfully created  users
	can read them when they are ready like they
	can read logs.  OR sending a letter. You dont
	care to know if the letter was delivered
	suyccessfully you only care if COULD NOT
	be delievered and any effrort to deliver
	it has been  stopped.

	Whereas in sync-processing you need to
	onSend something with the result because
	nobody does but you dont need to care
	about errors because they will cause
	a crash so you will find out about them
	for sure. Or you get undefined or an
	error back.


			onSend() reurns always a new box but
			 */
			// really all data should be added
			// when the box is created or with
			// calls to its add()?
			// send () should only be given an error?
			// well so it was. Makes more sense that
			// there is a method error. So you can
			// also add arguments to send which are all
			// added to data.

		// so better say something if you see something. The
		// receiver of the box attaches the handler to the
		// box which typically causes side-effects so it wants
		// to be   in ccontrol of those, it does not like
		// if the other side of the conversation is able
		// to executed those side-effects a thousand times.
		// The caller can always call again and get back a NEW box
		// to which it can atatch the same hadnelr s if it wants
		// them to be called again.
		// Its like inviting a guest and having that
		// guest come to eat at your table a thousand times.
		// No you muts be able to give the least privilege.
		// If you want to receive any number of notifications
		// then juts pas sin a function. A BOS REPRESENTS THE
		// RESULT OF A SINGLE CALL.

	data ()
	{
		return this[DATA] .concat([]);
	}

	funkFromData (arrayOrObject)
	{

	 // shows that (currently) cisf
	 // is a child of both  me and my parent
	 // meaning we see all real children even
	 // if they came from cache.
	 //
	 // That shows that   we dont need to
	 // prevent require in acyc by modifyi8ung
	 // the wrapper which is error prone since
	 // it relies on Node.js implementation of
	 // of module-loading. INSTEAD we
	 // can after the fact juts verify that
	 // each of our components requires only
	 // components which are declared as its
	 // arguments or those from ndoe_modules.
	 // EVEN BETTER AND SIMPLER: WE CAN verify
	 // that they REQUIRE NOTHING  because we have
	 // done that for them so all they need
	 // is to use their arguments.
	 // =>
	 // This design translate simply to es6
	 // modules where we simply need to change
	 // the method that does tha verification?
	 // Well yes but and the verification is now
	 // very simple it only needs to verify that
	 // even that the app and its components
	 // require NOTHING, which needs to be verified
	 // differently in ES6 modules but is very
	 // simple in the end.


		if (arrayOrObject instanceof Array)
		{ return this.funkFromArray(arrayOrObject)
		}
		if (arrayOrObject instanceof Object)
		{ return this.funkFromObject(arrayOrObject)
		}

		debugger
		err
		( `Invalid argument to send():
			 ${arrayOrObject} .
			 `
		)
	}


	 /*
			 we need onwe final box to which we
			 add results and whose add-handler
			 knows how many it needs.
			 We REUTN THAT BOX from here ,
			 like any do-handler would whose
			 result is not yet ready.

			 We evaluate all parallel functions
			 if they return a non-Box we juts add it
			 to the final box.
			 If they return a box we add an onSend
			 -handler to it which adds it to the
			 final box when it is sent. POINT:
			 We dont add it yet because we want the
			 send to happen only when all parallels
			 are ready
	---------------------

	// {}  creates parallel processing
	// all bracnhes will be evaluated and
	// results combined into a similar object
	// as the spec. But values of that result
	// can be N values just like any orfinary
	// normal handler.

	*/

	funkFromArray ($arr)
	{
		// []  creates an alternatives-handler
		// the first funk in the array which
		// returns not undefined will have its
		// result as the chosen result.

		 let self = this;
		 return alternativeHandler;

		 function alternativeHandler (...args)
		 {
			 for (let efunk of  $arr)
			 {
				 let v =  efunk.call(self, ...args);
				 if (v !== undefined)
				 { return v;
				 }
			 }

			 debugger
			 err
			 (`All alternative handlers returned undefined:
				 ${$arr}
				`
			 );

		 }
	}

	funkFromObject ($specOb)
	{
	   let Box = this.constructor;
		 let self = this;
		 return parallelHandler;


		 function parallelHandler (...args)
		 { // x (Box, Function);
			 let keys = Object.keys ($specOb);
			 let $howManyNeeded= keys.length;

			 let  myBoxResult     =  self.new();
			 myBoxResult[DATA][0] = {};
			 let $resultOb        = {};
			 myBoxResult[DATA][0] = $resultOb;
			 // So note we gather only a single result
			 // which is {} but whose jeys are the
			 // same as in $specOb and values are
			 // arrays which are the results of each
			 // parallel handler funk.

			 myBoxResult.onAdd
			 ( (ob) =>
				 {
					 let p        = ob.p;
					 let eResults = ob.values;

					 $resultOb[p] = eResults;
					 let keys = Object.keys ($resultOb);
					 let howManyWeHave = keys.length;

					 // the 0th element is {} what we want
					 // Where do the other datums come from?
					 // Well when we come here the argument-datum
					 // has already been pushed into the [DATA]
					 // of the result-box. That happens for
					 // each add-call. But when we created the
					 // result-box we already did
					 // myBoxResult[DATA][0] = $resultOb;
					 // We will not overwrite tat because
					 // each add juts does a PUSH, so more values
					 // will be added. And then we have the
					 // exatr logic above $resultOb[p] =  eResults;
					 // which adds what we really want.
					 // But this is not user-logic but built-in
					 // handling of {}. THEREFORE  below we get
					 // rid of the other results and keep only
					 // the 0th.
					 if ( howManyWeHave === $howManyNeeded)
					 { myBoxResult[DATA] = [myBoxResult[DATA][0]];
						 myBoxResult.send();
					 }
				 }
			 );

			 for (let p in $specOb)
			 {
				 let f =  $specOb [p] ;
				 let fResult =  f.call (self, ...args);
				 let vs;
				 if (fResult instanceof Array)
				 { vs = fResult;
				 } else
				 { vs = [fResult];
				 }

				if (vs[0] instanceof Box)
				{ debugger // not tested
					vs[0] .onSend
					( ... values =>
						{ debugger
							myBoxResult.add ({p: p, values: values})
						}
					);
				} else
				{ myBoxResult.add ({p: p, values:  vs});
				}
			 }
			 return myBoxResult;


			 /*
			 Example:

				*/
		 }
	}


	/*
	You can call onSend() multiple times on the same box
	each call taking N onSend-handlers. Each call returns
	the  recipient. Each call will create a separate
	LANE of handlers where all get executed in succession.

	Poitn is that as you pass the box around multiple
	receivers of it may want to get acceess to its content.
	They can onSend that simply by making their own onSend-call.

	If recipient box had been sent already then
	the semantivcs is that the new handlers muts be
	executed on its existing data. But we muts not
	call the already executed handler because they
	cause side-effects and we dont want double
	side-effects. So we create a nwe box in which we
	add and executed those new handlers immediately.

	But we ALSO add them to the current box?
	No because any box can be sent only onceso
	adding them  to the current box would onSend nothing.
	 */

	do (...args)
	{ return this.onSend (...args);
	}

			onAdd (handlerF)
			{
				if (typeof handlerF !== "function")
				{ err
					(`onAdd() argument is not a function: 
						${handlerF}`
					);
				}
				this[META].addHandlers.push (handlerF);
			}

			notifyBoxLaneDone (  )
			{

			 if (this[META].previous)
			 { this[META].previous.notifyBoxLaneDone ();
				 return this;
			 }

			let start        = this[META].startTime;
			let maxAllowed   = this[META].maxTime;
			let endMs        = new Date().getTime();
			let took         = endMs - start;
			if (maxAllowed === undefined)
			{ maxAllowed    = Number.MAX_SAFE_INTEGER - 9876; // even safer
												// 9,007,199,254,731,115
			}

			if (took >  maxAllowed)
			{
				 // WE can come here even in sync processing
				 // simply if sync execution of the handlers
				 // takes too long.

				this.error
				( `
	send() took ${took} ms 
	which is longer than the max. 
	allowed ${maxAllowed} ms. 
	Msg: ${this[META].timeoutMsg} 
	` 	  );
			}

			return this;

			}


	/*
	box is a computing stage.
	It can have MULTIPLE on Sent handlers
	some of which are NAMELESS  and often the
	handlers are namelsss. THEREFORE it is good
	we add the name argument

	 */

	/**
	 * error(e) is called by user code to CAUSE
	 * an error. Why would you ever want to
	 * CAUSE an error? Because maybe the user-code
	 * detects it is called with invalid data.
	 */




			propagateError (e)
			{
				this[META].error = e;
				// we store it into me because it can be a timeout
				// error which means my send has not yet happened.
				// Then when the send happens we can see the error has
				// already ahppened and onSend not try to call later
				// onSend-handlers. ???
				//
				// but then timeout should not cause an error YET but only later?



			this[META].eHandlers.map
			( eh =>
				{ eh.call(this, e);
				}
			);

		  if (this[META].previous)
			{ this[META].previous.propagateError (e);
				return e;
			}

			if (! 	this[META].eHandlers.length)
			{ err
				(`${e}`
				);
			}
			return e;
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
		}.init () ;
	}

	}





// ebcause latestBox handlers were added
// to boxA boxA now has 2 onSend-handlers
// and the result its send() lists
// what both of them sent to their follower.
// Note the last handlers onSend not have handlers
// so they can produce no results therefore
// send juts returns what the box on which send
// was called sent forward which is the results
// of its handler functions.

// issue is when we  add mroe handlers
// then the reuslt should be the last box
// created so that we can add more dos to it
// later. But relaly when we want o use it we want
// to use it as a pipeline that starts from the first.
// THEREFORE: onSend() should always reurn a COPY
// of the recipient but add the new handlers
// at the END of tis pipeline.
// HOwever the pipeline is found by looking inside the
// boxes inside the arrays. But so be it.
//
// but then they all must be copeid?
// yes if we want each onSend to return a copy.
//
// ISSUE:  when handlers call ajax they must craete a new
// box. For that to be easy the handler should be bound to
// the box it is stored in so it can call new() on that.
// Tha we can onSend juts can not use
// already bound methods. Yes you can alsay create qa function
// which calls the method of some object inside it, but has itsa
// this bound or not to whatever.
// But the new box should then know about the NEXT box too?
// No because he handler returns the
// new box and will add a onSend-handler to it which will
// send to  the next onSend-handler in line..
// So todo we muts handle box-valued handler results differently.
// Handler need not know about previous box the calling send
// when it sees it gets a box-result can also attache the
// on-error handler to it which delegates to the previous
// box.
// well if the current box creates the new on then that
// takes care of delegating errors backwards we dont
// need to onSend more about that.
// If you want you coudl create a wholly new
// first Box which is not tied to anything

/*
note: sentHandlers get the same argument
as send-handler meaning first is either null
or an error, only that way they both know
if there was some error. But they onSend get
the box and now allso its data as 3rd argument.
 */
      // the server can call send() on a box
      // with no sent-handlers and  when client
      // adds those if wasSent() returns true
      // then those get immediately executed


/*
Because anybody can add send and add handlers it
is best that they all will expects the same
arguments always.  send() takes a first argument
only if there is an error.
			   // anybody can add extra send and add-handlers
			   // and then those would all have to expect the
			   // SAME extra arguments. Whereas if all handlers
			   // always take the same arguments which include
			   // the box then they all expect the same things
			   // and there is no confusion. The 'meta' -arg
			   // of the constructor gets stored and can be an
			   // arbitrary {} or anything, but note that then
			   // all handlers see the same meta-attributes.


add() takes a new datum as argument always
send() takes an error or nothing.

Handlerstake the box always as 2nd argument
because we don't want to bind the handlers
to the box since they might be bound to
something else already say a method-owner
Therefore we must pass the box as argument.

So when a send-handler is called it has no
1st argument if unless there was an error.
But it does have the box as 2nd argument
from which the handler can ask the data().

onSent -handler differs from onSend in that
when you add it if there already is data
it gets called with that. This way
you can call some applicaiton function
and get back a box and when you add to it
an onSent handler that gets called with
data as soon as the box has been called
send() at least once.

This is especially important because
we now prefer the app-function to create
and return the box. So if it sends the
box before it returns if user were to
add onSend() handler to it that would
not get executed because send was already
called. But with onSent it does,
*/

/*
POINT:  1st arg can be the plain data now that
error-handler is set as constructor argument.
=> onSend-handlers can take the plain data as argument.
=> we can still have add-handlers adding data
and detecting when there is enough.

How does the error-handler get called if there is
a timeout?
When a hdnler function creates  xhttp request giving iy yimrout.
it creates a box which it returns after tellinmg the ajax handler
to send to the box. Butr is also tells the ajax-timeout-handler
to call timeout on that box.  When the box was created
it was given a timeout handler or has a default which
calls the timeput of the predecessor if there is one.

the inner box is created by a sent-handler.
THerefore their this is the previous = creator box.
THEREFORE they can ask a NEWBOX from their 'this'
they need not access the global Box. THerefore the
new box can know its creator and thus can signal
it about timeout errors and thus a timepout need only
be set at the beginning of the line.

this.new ()  // sinve it is a box new crates a simile and i sshort.

When a new box is created its arg must be either
an error handler OR a box, which it would take
to be its predecessor. When you call new() that
passes the recipienit as the constructor
argument to tbe box it creates.

reason in async node.js always makes the error
the 1st argument is that there can always be
a timeout -error so therefore you nbetter always
test for an error instead.

But promises does it better because you give
a separate handler for onError. So you dont have to
test for the error. A sinleg handler i is like
single try-catch block around it all.

WE onSend it even better because we take the
error handler as argument Box-constructor
so on() calls remain simple AND they can take
multipel args which are the chained handlers.

If you create inner boxes you canm give them
thgeir own error-handlers similarly.

Tupically for inner boxes you return from handlers
you dontr give any onSend-handlers because we add
the one that when data is availabel sends the
data to the next box..

=> The funks in the chain can be sync otr async does not
matter. If they are async the only thing is they
muts  return a box, else nothing happens.
 */

/*
... eh would mean  that one arg-handler could
be an array and they would be internally combines.
But there is little p[oint because theyu would
juts become part of the greate pipeline.
would be better to
  we could make it so thayt fi a handler
IS an array then when its time to call it
we use map to produce an array of the results.

But that would get complicated becfause
the result of a handler can be EITHERT a Box
or not and those cases are handled differently.
So keep it simple understandable. This si not
a generalk data-flow framework but a utility
to unify async and sync functions.

Now the constructor of Box must take a timeout handler
as argument and all boxes conntexted to it when called
.error() gets that error propagated to
----------
Yes: point is  onSend() will create and return a new box.
Now this is the previous box. We must store the
handler to this box. But when send() gets called on it
result of that handler must be sent() to the new box.

By default new box does nothign when its send() is called
but whoever calls this egts the enw box and can attach
onSend()-handler(s) to it. But note even if they dont the
hadnler that was stored here does get executed.


		GOAL:" We want to onSend:
		  boxer ().onSend(a).onSend(b).onSend(c) ...

		where a b c can be either normal
		SYNC-functions returning their result
		OR they can be box-returning functions
		(which are typically async).

How this differs form promises? They onSend can
pass unfciotns reutnring promises as then-arguments.
But ours is clerer.
 I think
is that htere all then()-functions must be synchronous

		when send() executes
		it 	it execuets the hadnl;er function.

		It then gets all doHandlers typically
		just one. It is the box created above.
	Then it calls send() of that box
		passing as argument the RESULT of the
		handler function itr just called EXCEPT
		if that result is abox. In that case
		the  that box will be give onSent or onSend
		 whiuh hen tyhe result arrives
		 it passes it on to the next public box in the chain.


		 */
		  // onSend is much shorter to type
		  // someBoxer().onSend(handler)
		  /*
		  onSent() returns the box? well it could but
		  then adding more handler would add them to the same box?

		  YES BUT the trick is that when the box has more than
		  one handler then it first executes first and passes
		  its result then to the next. That5 measn we can
		  chain functions which need not be async together
		  with

		  boxer ().onSend(a).onSend(b).onSend(c) ...

		  DOERS are SYNC functions they get a result
		  as argument AND RETURN IT TRANSFORMED because
		  their semanticvs is that they are executed when
		  a result is ready.

		  But what if does needs to fcall ajax?

		  onSend(a) returns a box but that box is also stoed
		  intot he previous box which created it.
		  But is is a separate box.
		  the creator of box kwnos all boxes it has given
		  out so when it triggers it sends them all
		  its new data.
		  nbow box be triggers it also knows its
		  follwoer boxes and sends them its result.

		  BUT TRICK is a b c can be IIETHER syn-functions
		  OR they can be BOXES.

		  wehn a gets exsecuted if it reurns a boc
		  then that box is internally given
		  as the onSend the next function.
		  If it reurns non-box then that is passed
		  to the next handler as argument directly.
		  that gets called anagain if box then
		  we just add ot hat box the next handler.


		  RULE:
		  Box.onSend() returns a new Box to which you can
		  send onSend() again. But the previous box
		  remebers all follower boxes it has typically
		  juts one.
		   */



  /*
  finalBox has NO onSend handlers since it is the end of the line.
  BUt it has modified boxA() so that all functions get
  called when boxA gets sent. NOte typoically you dont
  onSend that sending but the function which returned boxA
  does. You juts add handlers to it. That modifies boxA

  the POINT of getting the final box is that then
  you can add more handlers to that. YOU dont need
  to send to boXA only to add handelrs to it.
  You need the finalBox because you may want to
  add handlers to that.

  Therefore SENDING TO FINAL BOX DOES NOTHING

   */


		  // When execution by a onSend-handler
		  // by send() causes an error
		  // send() calls propagateError. If we have
		  // onSend-handlers followers we call their
		  // same method with the same error.
		  // If there are no handlers then
		  // we look for and execute eHandlers
		  // in the current box.
		  //
		  // If there are no eHandlers in me
		  // then we njuts cause an error.
		  // So ehandlers onSend nothing unless attached
		  // to the last box in the chain? Or should we allow
		  // them in the mioddle as well?

		  /*
		  note there can be mnuktiple followers
		  errors should be propagatred to them all
		   */



// If notifyBoxLaneDone() sees it took longer
// than thge time set up by time() it will throw
// an error which is caught above and
// will be handled by the same
// per-box specific  error handlers
// set up by user, if any.

// If  result of a send-handler is a Box then we
// add to it a onSend-handler which when the box
// becomes ready  will send the data to the
// follower-box - instead of trying to send
// something which does not yet exust right away

			// note if above there are errors they
			// become part of the result of send()
			// but that does not mean errors would be
			// sent on to the follower boxes. The result
			// of send() is only for diagnostic purposes.

/*
Because we want to incrementally add
multiple parallel onSend-handelrs to an object
we can not be immutable. And the idea is you
get a box as a result of some function and
then you add your own sent-handlers to it.
Now if the handlers were added to a copy
then they presumably would not be called when
the original is sent UNLESS the original kept
a list of all its copies.

THEREFORE
we want onSend() to modify the orignal but also return
a new follower node which is connectd to the original.

WE can have the method copy and add more dos to the
copy. That means when original is sent send()
the copy will not be triggered nor will the things
added to the copy and you can send() to the copy.
That would trigger both the old and new handlers.


 */

		  // When handler is called its  result will be
		  // sent to the new box we created here. At the end
		  // of the line the new box DOES NOTHING. Its point is that
		  // follower-boxes COULD be added to it. If not then it does
		  // nothing but the handler-function here still got
		  // executed, for its SIDE-EFFECT (only).
		  // the HANDLER IS ADDED TO ME because the point is
		  // if you add nothing to the new box then it has no
		  // handlers.
		  // We reurn the new box so you can add more tpo it
		  // BUT at the same time we also modify the recipient
		  // so calling send() on it will trigger those
		  // latger handlers as well.
		  // POINT: result of onSend() is always the new box added
		  // so it is easy add more. If you then go back and
		  // and call onSend again on the first box that creates
		  // adds a parallel onSend-handler to original and returns
		  // the new box. Measn you add a parallel LINE and
		  // the point is the parallel line does its own calculations
		  // of what to pass on. They dont affect the other liens.
		  // BUT  note all lines end in side-effect only