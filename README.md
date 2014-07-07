Angular Tryton
==============

![](example/images/ng-tryton-logo.png)

An [AngularJS](https://github.com/angular/angular.js) module that makes tryton JSONRPC working in the *Angular Way*. Contains two services `tryton`, `session` and one filter `urlTryton`.

Install
=======

```bash
bower install angular-tryton
```

Usage
=====

### Require `openlabs.angular-tryton` and Inject the Services

```javascript
angular.module('app', [
    'openlabs.angular-tryton'
]).controller('Ctrl', function(
    $scope,
    tryton,
	session
){});
```


How to contribute
-----------------

If you're still convinced that angular-tryton needs to be modified in order to handle your problem and you have an idea on how to do that, well here's how to turn that idea into a commit (or two) in easy steps:

1. [Fork Angular Tryton](http://github.com/openlabs/angular-tryton) into your very own GitHub repository

2. Install git pre-commit hook `cp .hooks/pre-commit.sh .git/hooks/pre-commit`

3. Modify code as required.

2. Once you're satisfied with the changes and you want the rest of the Angular Tryton developers to take a look at them, push your changes back to your own repository and send us a Pull request to develop branch. Don't forget to add test with minimum 100% test coverage.


TODO
----
* Elaborate documentation for services and filter.
