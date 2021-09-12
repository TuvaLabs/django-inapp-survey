import os
from setuptools import setup, find_packages

import inapp_survey


def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()

setup(
    name='django-inapp-survey',
    version=inapp_survey.__version__,
    packages=find_packages(),
    include_package_data=True,
    license='Apache License 2.0',  # example license
    description='A simple Django app to conduct Web-based survey or do announcement.',
    long_description=read('README.md'),
    url='https://github.com/TuvaLabs/django-inapp-survey',
    author='Jaimin <jpatel@tuvalabs.com>, Naveen <nganesan@tuvalabs.com>',
    author_email='support@tuvalabs.com',
    classifiers=[
        'Environment :: Web Environment',
        'Framework :: Django',
        'Framework :: Django :: 3.2',  # replace "X.Y" as appropriate
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',  # example license
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        # Replace these appropriately if you are stuck on Python 2.
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: Dynamic Content',
    ],
    install_requires=[ 'django >= 3.2', 'djangorestframework', 'django-extensions' ],
)
