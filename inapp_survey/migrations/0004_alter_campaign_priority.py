# Generated by Django 3.2 on 2024-05-10 05:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inapp_survey', '0003_auto_20240510_0351'),
    ]

    operations = [
        migrations.AlterField(
            model_name='campaign',
            name='priority',
            field=models.CharField(choices=[('normal', 'Normal'), ('high', 'High')], default='normal', help_text='Note: Normal Priority will show the campaign after 5 minutes. High priority will show the campaign immediately.', max_length=10, verbose_name='Priority'),
        ),
    ]