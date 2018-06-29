
####  SendBox: Simpler than Promise

##### 1. USAGE:

let Box = require ("../sendBox");
let box = new Box();
box.onSend ( arg => console.log(arg) );
box.send(5);


##### 2. RELEASE-ANNOUNCEMENTS:
   
https://twitter.com/ClassCloudLLC
   
   
#### 3. MOTIVATING EXAMPLE

You want a simple way to code
asynchronously. Maybe you need
to interact with web-services,
or you want to program Node.js.
where asynchronous APIs is the
way.

You want simplicity but also power.
In fact simplicity is power,
it can enable you to do things that
otherwise might be too complicated
to get done.

To do async-processing
you can use plain old callbacks.
But callbacks within callbacks
make the code hard to "follow".

You can use Promises but they
are quite complicated too.
See this discussion on Stack OverFlow:
https://stackoverflow.com/questions/31324110/why-does-the-promise-constructor-require-a-function-that-calls-resolve-when-co

The basic problem with Promises
is that while they are easy to use
with "await" keyword, they are
not easy to create. You can not create
a Promise by calling "new Promise()".

SendBox provides a simpler metaphor
to think about async processing.
You create a box simply, with:

         let myBox = new SendBox() ;

At this point there is nothing in the
box. But you can pass it around. You
can return it as the result of your
function.

Recipients of the box can then say what
they want to do with the contents of the
box, when it gets some. In other words
when the "box is sent":

        theBox.onSend ( contents =>  {console.log(contents)}

Typically the function which creates the box
starts some async API-call like reading the
contents of a file, providing a callback
as argument as required by whatever API they
are using:

        fs.readFile (filePath, 'utf8', cb);

        function cb (e, fileContent)
        { myBox.add (fileContent)
               .send();
        }

The callback gets called by the system when
the file's contents are ready.
Callback adds the contents to the box and
"sends the box". This means that anybody
who has registered onSend -handlers with
it will be notified and will get the content.

The add() and send() are typically combined into one:

        function cb (e, fileContent)
        { myBox.send (fileContent);
        }

A SendBox is much like a Promise but simpler.
It is simpler because you can create one
with "new SendBox()".

It is simpler because it
follows the Object-Oriented principle of
encapsulation. You can create a SendBox
without knowing HOW the constructor
creates it. You only need to know what
you can do with the RESULT of the constructor.
Simplicity is power because it enables
you to do things.

2nd part of the power of SendBox is that
you can combine them into sequences where the
contents of one box gets sent to the next,
asynchronously.  The internal processing of
each such box can consist of a box-sequence
of its own recursively.

In other words **SendBoxes are composable!**
This means that systems you build out of
them remain simple because then all
parts follow the same "design pattern"
which you only need to understand once.

Composing boxes into a sequence is our
2nd example.


#### Motivating example 2: Pipeline

You want to make your website more interesting
by showing the name of a random country and
its capital on top of the page every time
the page is loaded. Give your visitors
an interesting factoid that makes your page
more fun to visit.

You want to get a list of all countrries
from somewhere, pick a random one from them
then get a list of capitals keyed by the
country-code and print out the random
country with its capital:

Capital of Northern Mariana Islands is Saipan.

You can create a (Send-)Box which does this
as follows. Note, we use "Box" as a short
synonym for SendBox. Shorter means less
typing means less typos:

    const Box = require("sendbox");

    new Box().onSend
    ( produceCountriesList
    , selectCountry
    , retrieveCapitals
    , tellCountryAndCapital
    ).send ("http://country.io/names.json") ;


Above we create a new instance of
Box (a.k.a SendBox) by calling its
constructor without arguments.

Then we **add N on-send handlers** to it.
Finally we "send" it passing in the
url of a web-service that will give
us a list of all countries.

Each handler in the list gets the data
produced by the previous handler in it
as argument. The first one gets the data
we passed as argument to send().

Thus we have our processing pipeline
set up where each stage produces more
data based on what it gets as argument.
Lets go over each stage and explain
waht they do. They are all simple
functions, bound together by SendBox:


###### produceCountriesList()

	  function produceCountriesList ( url )
	  { return Box.fromUrl (url)
	  }

'produceCountriesList()' makes a call to the
built-in SendBox static api-method 'fromUrl()'.
That returns an instance of a Box which will
be "sent" the contents of the web-resource
identified by its argument, when system has
downloaded it.

You could add an onSend -handler to that box
like any box. But you don't need to. The earlier
call to onSend() has done that for you because
you called it with multiple handler-functions.
'onSend()' has made it so that when the box
created by the first handler is "sent", the
data that is sent is passed as argument to
the next handler, and so on.

Our initial argument was url  "http://country.io/names.json"
What that web-address serves is not HTML, but JSON.
That will be the result of produceCountriesList(),
automatically passed on to the next stage ...



###### selectCountry()

	function selectCountry (json)
	{
	  let codesToNames = JSON.parse(json);
	  let keys         = Object.keys (codesToNames);
	  let rix          = Math.floor (Math.random() * keys.length);
	  let countryCode  = keys [rix];
	  let countryName  = codesToNames [countryCode];

	  return [key, countryName];
	}

Because the previous stage produced json, that is
what this stage gets as argument. We parse it with
JavvaScript's built-in JSON.parse which gives us
an Object. This particular object will have
country-codes as keys, country-names as values.

We then randonmly select one country-key and
look up its name from the data that was parsed
from the argument-json.

We  return two pieces of data, the country-key
and the country-name. The next stage will get
them both as separate arguments.

###### retrieveCapitals()

    function retrieveCapitals (countryCode, countryName )
	{ let b = Box.fromUrl ("http://country.io/capital.json");
	  b.add (countryCode)
	   .add (countryName);
      return b;
	}

The above handler retrieveCapitals() is again very simple,
but it demonstrates one more trick you need to know
to use SendBox effectively.

This time we use a different web-resource to give us
json which tells us the names of the capitals,
"http://country.io/capital.json". Again, that
url can go down without notice, but seems to be
there as we're wrgting this.

Next comes the interesting part, we add data to
that box ourselves before returning it.  A send-
handler can return two things, data or a SendBox.
If it has the data it would return it, but if
it does not it will return a box which will
have the data at some later point in time.

If it returns a box the next stage in the pipeline
will not be called immediatetly with that box as argument.
Instead it will be called later with the data
of that box when that data becomes ready.

The "data" of a box is what you pass to it
as arguments of send(). But in addition
you can add data to the box by calling
its method 'add()', which is what we do above.

So when the box 'b' returned by retrieveCapitals()
gets sent, the next handler in the chain will get
THREE arguments: countryCode, countryName,
and then the json that was retrieved from the
web, by that time. They are passed as arguments
in this order because we added the first two
in this order and then after that the system
added the json it got from the web. Then it
continues by processing the next stage passing
it those 3 data-elements as 3 arguments:


###### tellCountryAndCapital()

    function tellCountryAndCapital
             (countryCode, countryName, capitalsJson)
	{
	  let capitals = JSON.parse (capitalsJson);
	  let capital  = capitals [countryCode] ;
	  let s        = `Capital of ${countryName} is ${capital}`;
	  log(`\n${s}\n`);
	}

Above code should by now be self-explanatory,
no new tricks. What we have done is
we have passed a set of data through the pipeline
adding to it during the process, so in the end
we have both the country-code and the country-name,
and the capitals-json. The country-names and capitals
came from different web-services asynchronously
and our pipeline has combined them together,
in the proper order.

A pipeline like above is not too different
from a physical assembly-line in a
car-factory.  As the to-be-car moves along the
assembly-line new parts like doors and wheels
and engine are added to it at each stage.
In the end the car is a car -- because all
the parts have been added to it in their
correct  location in the right order.

Voila the log shows:

    Capital of Egypt is Cairo


#### Coda: Keep your Promises too

As argued earlier the problem with
Promises is even though they are easy
to use, they are difficult to create.

SendBox solves that problem.
You can create a SendBox simply then
transform it into a Promise simply.
This is done by its method 'promise()':

    async function awaitTest ()
	{
	  let box = new Box();
	  setTimeout (() => box.send ("hello"), 3 );

	  let result = await box.promise();
	  ok (result === "hello");
	}

The reason to do this would be if you
want your Api-methods to return a Promise
because they then can be simply consumed
with the "await" -keyword, as shown.

SendBox helps by creating the promise
for you.





 
#### 4. INSTALLATION

     npm install box
    
#### 5. PROCURING SendBox

##### A) With Node.js

    const Box    = require ('sendbox');

##### B) In browser

If box.js detects it is not running in Node.js
it stores its exports into the global variable
"SENDBOX" which you can then access from
your HTML-page:

    <script src="sendbox.js">   </script>
    <script> let Box = SENDBOX; </script>



SEE: **test_browser.html** which does the
above and then runs all CISF-tests 
within the browser. To
check whether it runs on your browser 
open  **test_browser.html** in it. 
Seems to work on latest versions of Edge, 
FireFox and Chrome but not in IE-11. 

#### 6. API


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
				return this;
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



#### 7. Tests

The file test.js in the same directory as
box.js contains the tests that in detail
show how you can use box.js.

   
#### 8. Why is this called SendBox?

Because we pass around something which
like a box can have multiple things
inside it. You can put multiple things
inside it by calling add() multiple
times.

When you want to notify the
recipients of the box that there
is content inside it you call the
send() -method of the box.

It is not quite an accurate metaphor
because the recipient gets the box
even before it is "sent". But no
metaphor is perfect are they.


#### 9. License
SPDX-License-Identifier: Apache-2.0




