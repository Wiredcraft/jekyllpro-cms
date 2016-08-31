#!/usr/bin/env python
import os
import sys
import shutil

from jekyllplus import __version__, __author__

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

setup(
    name='jekyllplus',
    version=__version__,
    description='Jekyll Pro',
    url = 'https://jekyllplus.com',
    author=__author__,
    author_email='jekyllplus@wirecraft.com',
    license='Proprietary',
    package_dir={ 
        'jekyllplus': 'jekyllplus',
    },
    packages=[
        'jekyllplus',
        'jekyllplus.api'
    ],
    scripts=[
        'bin/jekyllplus'
    ],
    install_requires = [
        'futures==3.0.5',
        'Jinja2==2.8',
        'PyYAML==3.11',
        'requests==2.9.1',
        'sh==1.11',
        'tornado==4.3',
        'docopt==0.6.2'
    ],
)
