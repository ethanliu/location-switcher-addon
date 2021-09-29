Location Switcher lets you switch between sites by click the ☯ icon from the address bar.  
In most cases, you would like to switch between development and production sites.  

For example a simple route:

http://localhost <-> http://remote.example.com

Multiple destination for the same source:

http://dev.local <-> https://production.server  
http://dev.local <-> http://test1.stage.server  
http://dev.local <-> http://test2.stage.server  

Custom routes: (Loop option unchecked)

http://dev1.server -> http://dev2.server  
http://dev2.server -> http://dev3.server  
http://dev3.server -> http://dev1.server  

### Notice

- All routes followed by the order and did not check any duplicate or conflict.
- file:// protocol is not support due to the security policy by Firefox.

## How it works

It walks through each route as a prefix to find the first matched record for the current URL.  
Replace previously founded prefix with above or selected destination from the current URL.  

## Description

- When only one source/destination pair is available, click on ☯ will toggle the links for the current tab.
- When multiple destinations are available, click on ☯ will display all destinations in a popup.
- Allows opening link in a new tab by cmd/ctrl/middle-click on ☯ or links from the popup.
- Allows choosing an icon or custom image for each route.
- Allows disabling routes without deleting.


## How to build

There's no any dependency of this plugin, however it use eslint to validate javascript files, uglifyjs and cleancss to remove comments and reduce the file size for production.

    npm i -g uglifyjs
    npm i -g cleancss
    npm i -g eslint
    npm i -g web-ext

To build the plugin and archive for code review (without any minify)

    build.sh <target>

It will generate two archives for the specified target in the dist folder.


## Extension versions

### firefox

The original version, keep it simple and lightweight.

### firefox-advanced

Advanced or experiment version, requires more permissions.  
Differences from the original version:

- Option for replacing the favicon
- Favicon snatcher helper buttons

### chrome

Experiment, no public release yet.


## Download

https://addons.mozilla.org/en-US/firefox/addon/location-switcher  
https://addons.mozilla.org/en-US/firefox/addon/location-switcher-advanced (Experimental)  

## Source code

https://github.com/ethanliu/location-switcher-addon

