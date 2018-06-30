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


let {ok, fails, x, log, err, eq
    } = require ('./cisf/cisf.js');

let SendBox   = require ("../sendBox");


testBox ();

function testBox ( )
{

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

  let Box = SendBox ; // Box is  a shorter synonym
  let $errors = [];

  mostBasicTest       ();
  httpTestWithBox     ();
  httpTestWithAwait   ();
  composeTest         ();

	syncTest        		();

	parTest         		();
	condTest        		();
	parAndCondTest  		();

  nodeJsApiTest       ();

	addTest             ();

	errorTest           ();
  onSendAfterSendTest ();
  
	asyncSendTest       ();
	asyncHandlersTest   ();
  timeoutTest         ();



  promiseTest (`sendBox.js ${Box.v} all tests passed`);

	return;

function tell_tests_passed (s)
{ s = `SendBox ${Box.v} tests passed.`;

if (typeof require === 'undefined')
{ s = `<h1>${s}</h1>`;
 s += `
<pre><tt>
${testBox}
</tt></pre>
`;
}

  console.log("");
  console.log (s);
  console.log("");
  if (typeof document !== "undefined")
  { let doc = document;
    setTimeout
    ( function ()
      { if (doc && doc.body && doc.body.innerHTML)
         {  doc.body.innerHTML +=  s  ;
         }
      }
    , 1000
    );
  }
}


// "http://www.google.com?q=" + countryName

		  
		  
	function composeTest ()
	{

debugger
// welll note if we load the jsons from, relative
// urls then in fact the current way we retrueve
// utsl would not work it expecst http server.
// But the idea of this test really is that
// we should be able to retrieve data from the
// web so therefore let us use our github
// pages top serve the jsons, meaning we muts
// use abs-urls here.

    new Box().onSend
    ( produceCountriesList
    , selectCountry
    , retrieveCapitals
    , tellCountryAndCapital
    ).send ("https://panulogic.github.io/sendbox/test/countries.json");

    // ("http://country.io/names.json") ;

	  function produceCountriesList ( url )
		{ return Box.fromUrl (url)
		}

		function selectCountry (json )
		{
		  let codesToNames = JSON.parse(json);
			let keys         = Object.keys (codesToNames);
			let rix          = Math.floor (Math.random() * keys.length);
			let key          = keys [rix];
			let countryName  = codesToNames [key];
			return [key, countryName];
		}


    function retrieveCapitals (countryCode, countryName )
	  {
	    // let b = Box.fromUrl ("http://country.io/capital.json");
	    debugger
	    let b = Box.fromUrl
	    ("https://panulogic.github.io/sendbox/test/capitals.json");


//	  ("https://panulogic.github.io/sendbox/test/capitals.json"

		  b.add (countryCode)
		   .add (countryName);
      return b;
	  }

    function tellCountryAndCapital (countryCode, countryName, capitalsJson)
		{
		   let capitals = JSON.parse (capitalsJson);
		   let capital  = capitals [countryCode] ;
		   let s        = `Capital of ${countryName} is ${capital}`;
			 log(`\n${s}\n`);

		}
	}


		  // beware if a url does not exist you often
		  // get an error page with status 200 . Then
		  // the only error will be when we try to
		  // parse html as json.


  function getUrlPromise (url)
	{ return Box.fromUrl (url ).promise();
	}



async function httpTestWithAwait ()
{

  let u = 'https://panulogic.github.io/sendbox/package.json';
  // If the host does not exist we get a different
  // error because if host does but url does not exist
  // then the site typically gives us an error page.

  let content = await
  getUrlPromise (u)
  .catch
  ( e =>
    {   // Below we just report if we didn't
        // get the content, do nopt cause an error.
    }
  );
  // Note if you use promises and awaits
  // then you must use their error-handlilnng
  // mechanism to handle errros as well.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await


  if (content &&  content.match(/sendbox/i))
	{ log (` 
	HTTP-TEST succeeded httpTest() got sendbox package.json
	from ${u}.
	 `);
	} else
	{ log (` 
	   HTTP-TEST ERROR: httpTest() FAILED. 
	   This would happen if the url
	   ${u}
	   does not exist or does not have content
	   containing the word 'sendbox'.
	   Also check your net-connection. 
	 `);
	}
  return;
}


function httpTestWithBox ()
{

  let u = 'https://panulogic.github.io/sendbox/package.json';
  let content = '';

  let box =  Box . fromUrl (u);
  box.onError(EH_in_httpTestWithBox);


function EH_in_httpTestWithBox (e)
{
     log (` 
	   HTTP-TEST ERROR: httpTestWithBox() FAILED
	   to get url
	   ${u}.
     Maybe the website no longer exists or is down.
	   ${e} .
	 `);
 }

  box.onSend
	( c =>
		{
		  content = c;
		  if (  content.match(/sendbox/i))
	       { log (` 
	HTTP-TEST succeeded httpTestWithBox() got sendbox package.json
	from ${u}.
	 `);
	} else
	{   log (` 
	   HTTP-TEST ERROR: httpTestWithBox() FAILED. 
	   The content of 
	   ${u}
	   does not contain the string 'sendbox'
	 `);
	}
		}
	)

  return;
}


function mostBasicTest ()
{
  let SendBox = Box ;

  let box = new Box();
  let result;
  box.onSend ( x => result = x );
  box.send (5)
  ok (result === 5);

  box = new SendBox();
  box.onSend ( x => result = x );
  setTimeout(() => box.send (5), 500);
  setTimeout
  ( () =>
		{ ok (result === 5);
    }
  , 700
  );

}


function syncTest ()
{

  let box = getBox ();

  ok ( box.onSend (fa, fb, fc) === box );
  // Calling onSend() has a side-effect of adding
  // internal follower-boxes to the recipient.
  // onSend() then returns its recipient.
  // Note you can call it many times each time
  // adds a new box-lane to it which will
  // execute independently.

  let fa_result, fb_result, fc_result;
	let see = box.send (1, 2, 3);

  ok (see[0][0] === 10);
  // The result of send() is for diagnostic
  // purposes only it tells what data the
  // first handler in the pipe-lines of
  // handlers sent forwards. The first
  // handler is fa() which returns its 1st
  // argument * 10 as an arrray. So because
  // we passed in 1 as first argtument
  // measn fa() sent forwards 10.
  //
  // Because the data of a box and thus
  // the data that gets passed on in the
  // pipeline is always an array AND because
  // a box can have multiple processing pipelines
  // (crea5ted by multiple calls of onSend() on it)
  // the result of send() is always a 2-D array.
	// Note fa() gets as arguments 1, 2, 3 but it
	// chooses to use only its first argument to
	// calculate its result which is an array of
	// length 1, to keep the Test simple. Then
	// ollowers fb() and fc() only get one argument.

	ok (fa_result[0] === 10);   // 1 * 10
	ok (fb_result[0] === 100);  // 1 * 10 * 10
	ok (fc_result[0] === 1000); // 1 * 10 * 10 * 10

	fails (_=> boxA.send (4,5,6));
  // fails because a box can be sent ONLY ONCE.
  // Because async computation basically relies
  // on side-effects you typically want each
  // side-effect to happen only once so it is
  // PROBABALY a coding error if it would happen
  // multiple times. You can always create another
  // similar box if you want the same effect
  // multiple times.

	return ;

  function getBox ()
  { return new Box("BOX-ONE");
  }

	function fa (n, ... maybeMoreArgs)
	{ fa_result = [n * 10];
	  return n * 10;
	}
	function fb (n, ... maybeMoreArgs)
	{ fb_result = [n * 10];
	  return n * 10;
	}
	function fc (n, ... maybeMoreArgs)
	{ fc_result = [n * 10];
	  return fc_result;
	}
}

function parTest ()
{
  let fa_result, fb_result, fc_result, fd_result;

  let box = getBox ();

  box.onSend
  ( fa
  , { b: fb          // Parallel
    , c: fc
    }
  , fd
  );

  let see = box.send (1, 2, 3);
  // Above calls on functions fa fb fc and fd.
  // fa() multip[liess its argument by 10.
  // fb  multiplies its arguments by 10 and
  // fc by 100.  fd just assigns its argument
  // to the variable 'fd_result'. But fb and fc
  // execeute in parallel so in the end we get:

	eq ( fd_result
	   , { b: [100 , 200 , 300 ]
	     , c: [1000, 2000, 3000]
			 }
		 );

	return ;

  function getBox ()
  { return new Box("BOX-ONE");
  }

	function fa (... numbers)
	{ fa_result = numbers.map (n=>n*10) ;
	  return fa_result;
	}

	function fb (... numbers)
	{ fb_result = numbers.map (n=>n*10) ;
	  return fb_result;
	}

	function fc ( ... numbers)
	{ fc_result = numbers .map (n=>n*100) ;
	  return fc_result;
	  // because fb and fc now execute in parallel
	  // we want to see their different results
	  // on the same argument.
	}

  function fd (parallelResultOb, ... maybeMoreArgs)
	{ fd_result = parallelResultOb;
	  ok (maybeMoreArgs   .length === 0         );
	  fd_result = parallelResultOb;
	  return parallelResultOb;
	}

}

function condTest ()
{
  let fa_result, fb_result, fc_result, fd_result;

  let box = new Box("condTest");

  box.onSend
  ( fa
  , [fb, fa, fc]  // First one to return not undefined rules.
  , fd            // which is fa().
  );

  box.send (1, 2, 3);

	// fa multiplies its argument by 10.
	//
	// fb returns undefined. Because fa()
	// does NOT return undefined the result
	// of  [fb, fa, fc] is what fa() returns.
	//
	// So fc() never gets called. If it would
	// it would return a string saying  it does
	// not get called   which you would see below
	// as the final result but you don't.
	//
	// The 2nd time fa() is called its arguments
	// are what the 1st call to fa() returned
	// which are 10,20, 30.  So the 2nd
	// call to fa() will return 100, 200, 300.
	//
	// fd just assigns its argument to variable
	// 'fd_result' so we can check it here:

  eq (fd_result, [100, 200, 300]);
	return ;


	function fa (... numbers)
	{ fa_result = numbers.map (n=>n*10) ;
	  return fa_result;
	}

	function fb (... numbers)
	{ fb_result = undefined ;
	  return fb_result;
	}

	function fc ( ... numbers)
	{ return " this does not get called because fa() is";
	}

  function fd (... numbers)
	{ fd_result = numbers;
	  return;
	  // fd has no followers so it does
	  // not matter what it returns.
	}

}

function parAndCondTest ()
{
  let fa_result, fb_result, fc_result, fd_result;
  let box = new Box ("parAndCondTest");

  /* This example combines conditional and
     parallel execution into a single pipeline.
     Of note is that you can use arrow-functions
     to code more of what is happening in the
     pipeline definition itself. If the function
     is really simple that makes sense.

     fb() returns undefined so it is ignored
     in the conditiona [...]. fc() is also
     ignored in the conditional because fa().

     Note in practice whether one branch of
     a conditional [] returns undefined or not
     would depend on what arguments are
     passed ot it by the previous stage.

     [] is abit like JavaScript switch -statement,
     just simpler both syntactically and semantically.
     The result of the first function which returns
     non-undefined is its result, things don't
     call through like with 'switch'.

     Note below fa() gets called 3 times to
     produce the value of field 'a'.
  */

  box.onSend
  ( fa
  , [fb, fa, fc] // Conditional, fa() wins.
  , { a: fa      // Parallel, result has fields a and c.
    , c: (... ns) => ns.map (n=>n*5)
    }
  , fd
  );
	box.send (1, 2, 3);

  eq ( fd_result
     , [ { a: [1000, 2000, 3000]
         , c: [500 , 1000, 1500]
         }
       ]
	   );

	 /* The {} produces a single {} but it
	    gets passed to the follower-handler
	    as (the only) one of the N values.
	    fd() assigns  all the arguments it
	    gets as an array into fd_result, so
	    therefore the value of that is an array.
	  */

	return ;

	function fa (... numbers)
	{ fa_result = numbers.map (n=>n*10) ;
	  return fa_result;
	}

	function fb (... numbers)
	{ fb_result = undefined ;
	  return fb_result;
	}

	function fc ( ... numbers)
	{ fa_result = numbers.map (n=>n*5) ;
	  return fa_result;
	}

  function fd (... numbers)
	{ fd_result = numbers;
	  return;
	  // fd has no followers so it does
	  // no9t matter what it returns.
	}


}


function addTest ()
{
 let b = new Box ("b");
 b.onSend
 ( (a, b, c) =>
	 { ok (a === 1);
	   ok (b === 2);
	   ok (c === undefined);
	 }
 );
 b.send (1,2);

 let b2 = new Box ("b2");
 b2.onSend
 ( (a, b, c) =>
	 { ok (a === 1 && b === 2 && c === undefined);
	 }
 );

 b2.add(1);
 b2.add(2);
 fails (_=> b.send()); // can not send more than once

  b2.send()
  let box = getBox ();

  ok ( box.onSend (fa, fb, fc) === box );
  // Calling onSend() has a side-effect of adding
  // internal follower-boxes to the recipient.
  // onSend() then returns its recipient.

  let fa_result, fb_result, fc_result;

	let see = box.send (1, 2, 3);

  ok (see[0][0] === 10);

	ok (fa_result[0] === 10);   // 1 * 10
	ok (fb_result[0] === 100);  // 1 * 10 * 10
	ok (fc_result[0] === 1000); // 1 * 10 * 10 * 10

	fails (_=> boxA.send (4,5,6));
  // fails because a box can be sent only ONCE.
  // Because async computation basically relies
  // on side-effects you typically want each
  // side-effect to happen only once so it is
  // PROBABALY a coding error if it would happen
  // multiple times. You can always create another
  // similar box if ytou want the same effect
  // multiple times.

	return ;

  function getBox ()
  { return new Box("BOX-ONE");
  }

	function fa (n, ... maybeMoreArgs)
	{ fa_result = [n * 10];
	  return n * 10;
	}
	function fb (n, ... maybeMoreArgs)
	{ fb_result = [n * 10];
	  return n * 10;
	}
	function fc (n, ... maybeMoreArgs)
	{ fc_result = [n * 10];
	  return fc_result;
	}
}


function errorTest ()
{
	let $errors = [];    // e h() will put any errors here for us to see they were caught

	let box = new Box ("errorTest");
	box.onError (eh)
		 .onError (eh2);

	box.onSend  (fa, badF, fc)
	box.send (313);

	x ($errors[0] === 'eh(): TypeError: "ABC".noSuchMethod is not a function');
	x ($errors[1] === 'eh2(): TypeError: "ABC".noSuchMethod is not a function');

	return;

	function badF (arg)
	{ 'ABC'.noSuchMethod ();
	}

	function eh (e)
	{ $errors.push("eh(): " + e);
	  log(e);
	}
	function eh2 (e)
	{ $errors.push("eh2(): " + e);
	  log(e);
	}

	function fa (n, ... maybeMoreArgs)
	{ fa_result = [n * 10];
	  return n * 10;
	}
	function fb (n, ... maybeMoreArgs)
	{ fb_result = [n * 10];
	  return n * 10;
	}
	function fc  (n, ... moreArgs)
	{ throw "we never come here because earlier an error stopped the pipeline"
	}
}

function onSendAfterSendTest ()
{
	let result;
	let box = new Box("onSendAfterSendTest");

	box.send (176);

	box.onSend
	((n) =>
	 {  result = n + 1;
			return [];
	 }
	);
	ok (result === 177);

	/**
	 * A basic thing about async computing is that
	 * you should get the results when they are
	 * ready and as soon as possible. So if they
	 * are not ready ytou get a box which will
	 * have the results when they are ready and
	 * you can ask to be notified when they are
	 * by adding a onSend-handler to such a Box.
	 *
	 * But if they are already ready when you
	 * attach your handler to the box then
	 * the handlers will excuted right away.
	 * it does not, becauser it should not,
	 * matter whether you add the handlers to
	 * the box before or after the results
	 * are ready, as seen above.
	 */
}

function asyncSendTest ()
{
  let box = getBox ();
  box.onSend (fa2, fb2, fc2, fd2);

  let fa_result, fb_result, fc_result;
	return ;

	/*
	In this test we call the send()
	in a delayed fashion, it will be executed
	only in the next event-loop.

	We have added a new handler fd() whose
	purpose is just to verify that all previous
	stages have executed by the time fd()
	gets executed.

	Notice we don't call send() above at all.
	It is called inside getBox() but in a delayed
	fashion so it only executes in the next
	event-loop.

	This is the typical way Box() is used, you
	ask some API-function to calculate a result
	for you, which will take some time. The
	sub-system/function immediately returns
	a Box for you which is empty at the moment.
	When the subsystem is ready with the results
	of the calculation it will call send on the
	box. The onSend-handlers you have attached to the
	box then get executed so you know you have the
	results and can onSend whatever further calculations
	you need to onSend with them.
	*/

  function getBox ()
  { let box =  new Box("BOX-ASYNC_A");
  	setTimeout
  	( _=> box.send (1, 2, 3), 0
	  );
    return box;
  }


	function fa2 (n, ... maybeMoreArgs)
	{ fa_result = [n * 10];
	  return [n * 10];
	}
	function fb2 (n, ... maybeMoreArgs)
	{ fb_result = [n * 10];
	  return [n * 10];
	}
	function fc2 (n, ... maybeMoreArgs)
	{ fc_result = [n * 10];
	  return fc_result;
	}

	function fd2 (n, ... moreArgs)
	{
		ok (n === fc_result[0]);    // fd(() gets the results of fc() as argument

	  ok (fa_result[0] === 10);   // has been assigned
	  ok (fb_result[0] === 100);  // has been assigned
	  ok (fc_result[0] === 1000); // has been assigned

	  return [];
    // All  handlers must return either
    // an Array or a  Box. Eeven though this
    // is currently the last stage so my
    // result gets thrown away eturning
    // [] means that IIF (and we often onSend)
    // add a new stage into the  pipeline
    // tthe machinery cann hhandlle and
    // pass on my result without errors.
	}
}

function asyncHandlersTest ()
{
  let box = getBox ();
  box.onSend (fa3, fb3, fc3, fd3);

  let fa_result, fb_result, fc_result;
	return ;

	/*
	In previous Test we called the send()
	in a delayed fashion, making the reslts
	available only asynchronously.

  In this examplle we make the onSend-handler
  fa() asynchronous, so it will not return
  its results right away but instead return
  a box which  fa() will 'send' after a timeout.
  This means that the result of fa() will not
  be immsediately passed to the follower handlers
  but only later when the timeout has passed
  and the box returned by fa() is 'sent'.

  We only modify the first and 2nd handlers
  fa() and fb() in this way to have fewer
  moving parts, but any handler can onSend the
  same, return a Box which will later produce
  the results.
	*/

  function getBox ()
  { let box =  new Box("BOX-ASYNC_A");
  	setTimeout
  	( _=> box.send (1, 2, 3), 0
	  );
    return box;
  }


	function fa3 (n, ... maybeMoreArgs)
	{ ok (n === 1);
	  let box = new Box ("fa() result delayed");
	  box.onSend
	  ( n2 =>
			{ ok (n2 === 10)
			  fa_result = [n2]; // handler result must be array or box
				return fa_result;
			}
	  );
	  setTimeout (_=> box.send (n * 10), 2);
	  // timeout of 2 ms simulates a  task
	  // that would take 2 ms to complete.
	  return box;
	}

	function fb3 (n, ... maybeMoreArgs)
	{ let box = new Box ("fb() result delayed");
	  box.onSend
	  ( n2 =>
			{ ok (n2 === 100)
			  fb_result = [n2];
				return fb_result;
			}
	  );
	  setTimeout (_=> box.send (n * 10), 3);
	  return box;
	}

	function fc3 (n, ... maybeMoreArgs)
	{ fc_result = [n * 10];
	  // THIS handler unlike its predecessors
	  // is synchronous, just to demonstrate
	  // that they can be either.
	  return fc_result;
	}

	function fd3 (n, ... moreArgs)
	{
	  // Gere we just verify that all previous stages
	  // have produced their resultrs correctly.

		ok (n === fc_result[0]);    // fd(() gets the results of fc() as argument

	  ok (fa_result[0] === 10);   // has been assigned
	  ok (fb_result[0] === 100);  // has been assigned
	  ok (fc_result[0] === 1000); // has been assigned

    return [];
	}


}

/**
* In  timeoutTest() boxA causes no error because
* it has two handlers in in its pipeline fa and
* fb which are both synchronous.
*
* boxB has handler fC() which stops the
* pippeline until 56ms has passed and therefore
* causes a time-error because both boxes are
* given only time(55) so fc can not possibly
* end in 55 since it only starts after 56
* has passed.
* 
* If you set time() then ALL stages of the
* pipeline must complete in this time, or
* an error is created. If you also set an
* error-0handler then that is called for
* the time-error as well.
*
* Below we dont realy test for the errors
* but you should see the one timing error
* on the log.
*/

	function timeoutTest ()
{

	let $TIME_ALLOWED  = 55;//  -1 ;

	let boxA = new Box ("timeout-A")
					 . onSend (fA, fB)
					 . onError (eh )
					 . time  ($TIME_ALLOWED, "timeout-A");

	let boxB = new Box ("timeout-B")
					 . onSend (fC, fD)
					 . onError (eh )
					 . time  ($TIME_ALLOWED, "timeoutTest");

	 let $errors = [];
	 boxA.send ("boxA-data");
	 boxB.send ("boxB-data");


boxA.onSend
( arg =>
	{ ok(arg === "boxA-data");
	  log(`boxA done: ${arg}`);
	}
) ;
boxB.onSend
( arg =>
	{ ok (arg === "boxB-data")
	  log(`boxB done: ${arg}`);
	}
);


return;


	function eh  (e)
	{ console.log(`eh (${e})`);
		$errors.push(e) ;
	}

		// Beware of errors that might happen
		// in error-handlers!


	function fA (arg )
	{
		log (`fA (${arg})`);
		return `result-of-fa()`;
	}

	function fB (arg)
	{ log (`fB (${arg})`);
		 return `result-of-fb()`;
	}

	function fC(arg )
	{
	  let box = new Box('Created by fC');

	  setTimeout
		( () => box.send()
		, 56   // since max allowed is 55 56 will cause an error for sure.
		)
	  log (`fC will send box later`);
		return box;
		// Because I return a box which will be
		// sent only later the returned box may
		// take long than  the allowed 55ms which
		// should cause an error.
	}

	function fD (arg)
	{ log (`fD (${arg})`);
		return `result-of-async4()`;
	}


}

/**
 * nodeJsApiTest () shows how we can tame the Node.js
 * callbacks by putting them into boxes.
 *
 * We create a box with teo sequential handlers
 * box .onSend (getDirEnts, gotDirEnts);
 *
 * getDirEnts() returns a new box it creates
 * It then calls uses the node.js ASYNC api
 * fs.readdir() to get the names of all files
 * and dirs in the current directory. When the
 * callback happens that new box gets sent.
 * Because it was the result of getDirEnts()
 * it means the next handler gotDirEnts() gets
 * all the file and dirnames as argument.
 *
 * gotDirEnts() also creates a new box
 * to which it adds an onAddhandler which
 * counts how many values have been added
 * to it and when as many as there are file
 * and dir-names it calls send() on the box
 * that is returned by gotDirEnts().
 *
 * gotDirEnts()  adds an onSend() handler
 * to its result-box  which will call a final
 * handler gotAll() when ready which will
 * then get the  stats of all files and dirs
 * in the current directory.
 *
 * gotDirEnts() then calls terh Node.js async API
 * fs.lstat() with the absolute path of each file
 * and dir in the current directory. Because lstat()
 * is async we dont know when the result of each
 * call is ready so we use eachStateReady() as the
 * callback-argument to it.
 *
 * When eachStateReady  gets called it calls
 * statsBox.add ([stat, path]);  Note we must
 * have both the stat and path as part of the
 * data because the stat-datums returened by
 * Node do not know the filepath the file is
 * being referred to. There coudl be many
 * symbolic links referring to the same physical
 * file on disk after all.
 *
 * eachStateReady() calling add() means our
 * onAdd-handler fires for each stat. The
 * onHandler adds the [stat, path] as one
 * datum to the data of the box, and also
 * counts if we have all of them and when
 * we  do it calls send() of the box, meaning
 * the final handler gotAll() gets called with
 * all stats and their path. It creates a
 * single string telling the path and SIZE
 * of each file or dir and logs it for us
 * to show it all works.
 *
 * SO, this is quite complicated which is because
 * fs.readdir() and fs.lstat() are asynchronous
 * and we must call the lstat() for the whole
 * collection of file and dir names reurned by
 * readDir() and each such call then returns its
 * result async and we muts know when we have
 * all of them.
 *
 * It would be simpler had we used the synchronous
 * version of the APIs btu the point is to whose
 * that we can tame the async calls by putting them
 * into boxes. A similar thing has been done by
 * the Node.js current API by "promisifying" most (?)
 * of its async APIs. So this exammple showed that
 * we could do a similar thing with Boxes, in other
 * words in most cases Boxes can be used instead
 * of Promises, to make your code simpler to understand.
 *
 * How are Boxes simpler than Promises?
 *
 * They are simpler because you can create a
 * Box with a simple call to a pre-existing
 * constructor, then add send- and add- and
 * error-handlers to it as needed. Whereas with
 * Promises you must hand-code each promise-returning
 * constructor separately.
 * Try calling:
 *  let promise = new Promise();
 * and you will get error:
 * "Promise resolver undefined is not a function"
 *
 * So Promises don't really exemplify the
 * Object-Oriented concept of ENCAPSULATION:
 * You should be able to create a Promise without
 * knowing how it gets created,  then just use
 * it by calling its methods. You can not do
 * that with Promises but you can with Boxes.
 */


	function nodeJsApiTest ()
{
  if (typeof require === "undefined")
	{ // this test does not run on the browser
	  // because this relies a Node.js libraries
	  //'path' and 'fs'.
		return;
	}

  let Fs   = require("fs");
  let Path = require("path");

  let box = new Box ('get last modified dates async');
  box .onSend (getDirEnts, gotDirEnts);
  box.send();

  return;  // from nodeJsApiTest();


  function getDirEnts ()
  {
	  let box = new Box ('getDirEnts'); // reurns an instance of public Box
    Fs.readdir (__dirname,  cb);
    return box;

	  function cb(e, entsArray )
	  {  box.send ( ... entsArray );
	  }
  }

	function gotDirEnts(... $namesArray)
	{
	  let statsBox = new Box ('statsBox');

		statsBox.onAdd  (addStat);
		statsBox.onSend (gotAll)

		let size     = $namesArray.length;
		stats        = [];


		for (let name of $namesArray)
		{
			let path = Path.join (__dirname, name);
			Fs.lstat (path, eachStatReady);

			function eachStatReady (e, stat)
			{
				statsBox.add ([stat, path]);
			}
		}
		return;

		function gotAll (... allData  )
		{ // all of the stats were independently
			// retrieved using only async Node.js
			// APIs. Now we have them all and
			// can pass them on in case we add another
			// handler after me. But here the purpose
			// was really to show that we can get them
			// which we can onSend by combining them into
			// a single string and logging that.

			let sizes = allData.map
			(e =>
			 { let [stat,  path] = e;
				 // note the stat-record does not know
				 // the path of the file it is describing
				 return `${stat.size} ${path}`;
			 }
			);
			let s = sizes.join (`
	`);
			log(s);

			return stats;
		}


		function addStat ( [stat , absPath ])
		{ //  add() and add-handlers expect a single new value
		  // at a time, so if we want multiple fields you must
		  // pass an array or {} argument to add. Add-handlers
		  // are called with 'this' bound to the boix so they
		  // can inspect the data it already has and call
		  // send() on it if they think they now have enough

			let currentData = this.data(); // todo: use getters
			let got = currentData.length;
			let needed = $namesArray.length;
			if (got === needed)
			{ this.send();
			}
			// by now the stat was already added to the box.
			// our task is to count if this has been called for all of
			// them and if so send() on the main box
		}
	}

	function badF (arg)
	{ //  not currently called ?
		'abc'.nosuch ()
	}

}

// Beware Promise then() always gets executed
// only in the next eveent-loop.


function promiseTest (allTestsPassedMsg)
{ // CONVERT A BOX TO PROMISE

  let goodBox     = new Box("goodBox");
  let badBox      = new Box ("boxBad");
  let goodPromise = goodBox.promise();
  let badPromise  = badBox .promise();
  let TRACE       = {};

	goodPromise.then
	( good =>
		{ TRACE.goodPromise = 'FULLFILLED';
		}
	, bad =>
		{ TRACE.goodPromise = 'REJECTED';
		}
	);

	badPromise.then
	( bad =>
		{ TRACE.badPromise = 'FULLFILLED';
		}
	, bad =>
		{ TRACE.badPromise = 'REJECTED';
		}
	);

	goodBox.send ('good') ;
	badBox .error('bad')  ;
	testAwait (TRACE )    ;
	setTimeout (checkTheFuture, 200);
  return;


  async function testAwait (TRACE)
	{
	  let awaitBox = new Box('await');
	  let promise  = awaitBox.promise();

    setTimeout ( _=> awaitBox.send('AWAITED'), 50 );
    // Future is checked in 200ms so if we send
    // the awaitBox in 50 ms the wait should be
    // over by 200 definitely.

	  let value     = await promise;
	  // If you debug here it might look like the
	  // await is over immediately but if you put
	  // a debug ger -statement right after the call
	  // to me  the testAwait() you can see the await
	  // above causes first a jump out of here
	  // and we only come back when awaitBox has
	  // been sent because the timeout 50 has passed.

    TRACE.awaited = value;
	}

	function checkTheFuture ()
	{ let trace = TRACE;
  	ok  (trace.goodPromise === 'FULLFILLED');
		ok  (trace.badPromise  === 'REJECTED');
		ok  (trace.awaited     === 'AWAITED');
    log (`checkTheFuture () PASSED`);

    tell_tests_passed (allTestsPassedMsg) ;
	}
}

function ehX(anError)
{

}

function eh (anError)
{ $errors .push (anError);
}


} // end testBox()

