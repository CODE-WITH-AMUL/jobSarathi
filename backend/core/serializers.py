from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from company.models import CompanyProfile

from .models import Profile


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allow JWT login using either username or email in the username field."""

    @staticmethod
    def _resolve_role(user):
        if CompanyProfile.objects.filter(user=user).exists() or user.posted_jobs.exists():
            return "company"
        return "candidate"

    def validate(self, attrs):
        attrs = attrs.copy()
        identifier = attrs.get(self.username_field)

        if identifier and "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
            if user:
                attrs[self.username_field] = user.username

        data = super().validate(attrs)
        data["role"] = self._resolve_role(self.user)
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = cls._resolve_role(user)
        return token


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
    )
    role = serializers.ChoiceField(
        choices=("candidate", "company"),
        required=False,
        default="candidate",
        write_only=True,
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "confirm_password", "role")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email is already in use"})

        attrs.pop("confirm_password", None)
        return attrs

    def create(self, validated_data):
        role = validated_data.pop("role", "candidate")
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
        )
        user.set_password(validated_data["password"])
        user.save()

        if role == "company":
            CompanyProfile.objects.get_or_create(
                user=user,
                defaults={"name": user.username},
            )
        return user


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ["id", "user", "bio", "location", "phone", "avatar", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class ProfileUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ["bio", "location", "phone", "avatar"]
