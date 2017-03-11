from django.db import models


class Page(models.Model):
    title = models.CharField(max_length=200, default='')
    url = models.CharField(max_length=500)
    ref = models.TextField(blank=True)

    def __str__(self):
        return self.title
