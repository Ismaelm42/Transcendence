# from django
from django.urls import path, include
from . import views

# from rest framework
from rest_framework import routers
from .api import UserViewSet

# from rest framework
router = routers.DefaultRouter()
router.register('api/users', UserViewSet, 'users')

urlpatterns = [
	path('', views.hello),
	path('about/', views.about),
	path('index.html', views.index),
	# from rest framework
	path('', include(router.urls)),
]
