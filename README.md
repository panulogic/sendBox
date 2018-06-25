
####  Box: Simpler than Promise

##### 1. USAGE:


##### 2. RELEASE-ANNOUNCEMENTS:
   
https://twitter.com/ClassCloudLLC
   
   
#### 3. MOTIVATING EXAMPLE

#### Motivating example 2:




 
#### 4. INSTALLATION

     npm install box
    
#### 5. REQUIRING box.js

##### A) With Node.js

    const Box    = require ('box');

##### B) With  browser

If box.js detects it is not running in Node.js
it stores its exports into the global variable
"BOX" which you can then access like this from
your HTML-page:

    <script src="box.js"></script>
    <script> let Box = BOX;
    </script>



SEE: **test_browser.html** which does the
above and then runs all CISF-tests 
within the browser. To
check whether it runs on your browser 
open  **test_browser.html** in it. 
Seems to work on latest versions of Edge, 
FireFox and Chrome but not in IE-11. 

#### 6. API

##### 6.1  todo



#### 7. Tests
The file test.js in the same directory as
box.js contains the tests that in detail
show how you can use box.js.

   
#### 8. Why is it called Box?


#### 9. License
SPDX-License-Identifier: Apache-2.0




