from django.db import models

# Create your models here.
# This table should include encrypted password, friendlist, score, wins, losses, every kind of stat from the user
class User(models.Model):
	name = models.CharField(max_length=20)
	created_at = models.DateTimeField(auto_now_add=True)




