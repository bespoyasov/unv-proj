# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-11 12:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('personal', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='page',
            name='title',
            field=models.CharField(default='', max_length=200),
        ),
        migrations.AlterField(
            model_name='page',
            name='url',
            field=models.CharField(max_length=500),
        ),
    ]
