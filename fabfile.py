# -*- coding: utf-8 -*-
"""
    fabfile

    Fab file to build and push documentation to github

    :copyright: © 2013-2014 by Openlabs Technologies & Consulting (P) Limited
    :license: BSD, see LICENSE for more details.
"""
import time
import getpass

import os
from fabric.api import (
    local, lcd, cd, sudo, execute, settings, env, run, prompt
)
from fabric.decorators import hosts



def upload_documentation():
    """
    Build and upload the documentation HTML to github
    """
    # Build the documentation
    local('grunt ngdocs')

    # Checkout to gh-pages branch
    local('git checkout gh-pages')

    # Copy back the files from docs folder
    local('cp -a docs/* .')

    # Add the relevant files
    local('git add .')
    local('git commit -m "Build documentation"')
    local('git push')
    local('git checkout develop')

