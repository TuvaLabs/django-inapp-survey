# django-inapp-survey
In App Survey/Announcement for Django Application

=====
Inapp-Survey
=====

Inapp-Survey is a simple Django app to conduct Web-based In-App survey. For each question, user answers are saved and there are constraints can be set by
admin/staff users.

Quick start
-----------

1. Add "survey" to your INSTALLED_APPS setting like this::

    INSTALLED_APPS = [
        ...
        'inapp_survey',
    ]

2. Include the polls URLconf in your project urls.py like this::

    url(r'^inapp_survey/', include('inapp_survey.urls')),

3. Run `python manage.py migrate inapp_survey` to create the campaign models.

4. Start the development server and visit http://127.0.0.1:8000/admin/
   to create a survey (you'll need the Admin app enabled).

5. Visit http://127.0.0.1:8000/inapp_survey/ to participate in the survey.
