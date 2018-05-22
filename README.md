Location Switcher lets you to switching between sites by click the ☯ icon in address bar.

In most cases, you would like to switching between development and production sites.

You may also create a one way route, allows switch to "http://example.com" from "http://localhost", but can't switch back from "http://example.com" to "http://localhost".

It also allows you to create your own loop. For example:

http://dev3.local <-> http://localhost/demo
http://localhost <-> http://example.com
http://dev1.local -> http://localhost
http://dev2.local -> http://localhost

or create your custom loop

http://project.local -> http://test1.server
http://test1.server -> http://test2.server
http://test2.server -> http://live.server
http://live.server -> http://project.local

Please notice that, the preference will not test any conflicts, and it follows the order to matching the URLs.

## Download

https://addons.mozilla.org/en-US/firefox/addon/location-switcher

## Source code

https://github.com/ethanliu/location-switcher-addon
