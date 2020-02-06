Location Switcher lets you switching between sites by click the ☯ icon from the address bar.  
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
- file:// protocol is not support due to security policy by Firefox.

## How it works

It walk through each route as prefix by order to find the first matched record for current URL.  
Replace previous founded prefix with matched or selected destination from current URL.  

## Description

- When only one source/destination pair available, click on ☯ will toggle the links for current tab.
- When multiple destinations available, click on ☯ will display all destinations in a popup.
- Cmd/Ctrl/Middle-click on an item from popup to open the link in a new tab.
- You may change the icon for each destination instead of default ☯ in address bar.
- Allows to disable rules.

## Extension versions

### firefox

Original version, keep it simple and lightweight.

### firefox-advanced

Advanced or experiment version, requires more permissions.  
Differents from orignal version:

- Option for replacing the favicon

### chrome

Experiment, no public release yet.


## Download

https://addons.mozilla.org/en-US/firefox/addon/location-switcher

## Source code

https://github.com/ethanliu/location-switcher-addon

