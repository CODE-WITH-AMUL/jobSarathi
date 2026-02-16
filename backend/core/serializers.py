from rest_framework import serializers


class Userlogin(serializers.ModelsSerializer):
    email = serializers.EmailField(required=True , unique=True)
    password = serializers.CharField(required=True , write_only=True)
    
    

class UserRegister(serializers.ModelSerializer):
    pass