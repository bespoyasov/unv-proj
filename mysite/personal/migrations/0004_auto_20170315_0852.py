# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-15 08:52
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('personal', '0003_auto_20170311_1202'),
    ]

    operations = [
        migrations.AddField(
            model_name='page',
            name='x',
            field=models.CharField(default='0', max_length=10),
        ),
        migrations.AddField(
            model_name='page',
            name='y',
            field=models.CharField(default='0', max_length=10),
        ),
    ]
