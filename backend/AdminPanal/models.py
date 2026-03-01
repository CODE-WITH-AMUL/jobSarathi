'''
    This is the model for the website settings where we can 
    change the website name and logo or such things that are related to the website
'''

#--------------------------------[IMPORTS MODEL]--------------------------------#.
from django.db import models
from django.contrib.auth.models import User


#--------------------------------[MODELS]--------------------------------#
class WebsiteSettings(models.Model):
    logo = models.ImageField(upload_to="website/logo/")
    name = models.CharField(max_length=255 , null=True, blank=True)
    
    def __str__(self):
        return f"This is Site Setting for {self.name}"
    
    class Meta:
        verbose_name = "Website Settings"
        verbose_name_plural = "Website Settings"
        
        
        
        


    