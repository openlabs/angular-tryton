Angular Tryton
==============

.. figure:: example/images/ng-tryton-logo.png
   :alt: 

An `AngularJS`_ module that makes tryton JSONRPC working in the *Angular
Way*. Contains two services ``tryton``, ``session`` and one filter
``urlTryton``.

Documentation
-------------

Documentation is auto generated from the code using ``grunt ngdocs``.
Hosted version of the documentation can be seen at
`openlabs.github.io/angular-tryton`_

Install
-------

.. code:: bash

    bower install angular-tryton

Usage
-----

Require ``openlabs.angular-tryton`` and Inject the Services
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code:: javascript

    angular.module('app', [
        'openlabs.angular-tryton'
    ]).controller('Ctrl', function(
        $scope,
        tryton,
        session
    ){});

How to contribute
-----------------

If you’re still convinced that angular-tryton needs to be modified in
order to handle your problem and you have an idea on how to do that,
well here’s how to turn that idea into a commit (or two) in easy steps:

1. `Fork Angular Tryton`_ into your very own GitHub repository

2. Install git pre-commit hook
   ``cp .hooks/pre-commit.sh .git/hooks/pre-commit``

3. Modify code as required.

4. Once you’re satisfied with the changes and you want the rest of the
   Angular Tryton developers to take a look at them, push your changes
   back to your own repository and send us a Pull request to develop
   branch. Don’t forget to add test with minimum 100% test coverage.

Authors and Contributors
------------------------

This module was built at `Openlabs`_.

Professional Support
--------------------

This module is professionally supported by `Openlabs`_. If you are
looking for on-site teaching or consulting support, contact our `sales`_
and `support`_ teams.

.. _AngularJS: https://github.com/angular/angular.js
.. _openlabs.github.io/angular-tryton: http://openlabs.github.io/angular-tryton/
.. _Fork Angular Tryton: http://github.com/openlabs/angular-tryton
.. _Openlabs: http://www.openlabs.co.in
.. _sales: mailto:sales@openlabs.co.in
.. _support: mailto:support@openlabs.co.in


