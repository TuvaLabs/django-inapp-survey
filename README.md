## django-inapp-survey
In App Survey/Announcement for Django Application

Inapp-Survey is a simple Django app to conduct Web-based In-App survey. For each question, user answers are saved. You can set the constraints by which the announcement/survey questionnarie is shown on specific page or specific users.

Quick start
-----------

1. Installation

    ```shell
    $ pip install django-inapp-survey
    ```

2. Add `inapp_survey` to your `INSTALLED_APPS` settings like this::

    ```py
    INSTALLED_APPS = [
        ...
        'inapp_survey',
    ]
    ```

3. Include the `inapp_survey` URLconf in your project `urls.py` like this::

    ```py
    url(r'^inapp_survey/', include('inapp_survey.urls')),
    ```

4. Run `python manage.py migrate inapp_survey` to create the campaign models.

5. Start the development server and visit http://127.0.0.1:8000/admin/
   to create a survey (you'll need the Admin app enabled).


Usage
-----------

There are two types of `campaign` you can run -

1. `Announcement` - Plain informative announcment
2. `Survey` - It allows survey questionnaire, and expects each step as question


TODO: Markdown usage

TODO: Example screenshots

TODO: Hows `custom_params` works

TODO: Explain model fields for Campaign



