from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from company.models import CompanyProfile

from .models import Profile


class RoleAwareTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Base JWT token serializer that validates user role.
    Used by role-specific login endpoints.
    """
    required_role = None  # Override in subclasses
    
    def validate_role(self, user):
        """Override in subclasses to enforce role validation"""
        pass

    @staticmethod
    def _resolve_role(user):
        """
        Resolve user role from Profile model.
        Falls back to CompanyProfile for backward compatibility.
        """
        try:
            if hasattr(user, 'profile'):
                return user.profile.role
        except Exception:
            pass
        
        # Fallback for backward compatibility
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
        
        # Validate user has the required role if specified
        if self.required_role:
            user_role = self._resolve_role(self.user)
            if user_role != self.required_role:
                raise serializers.ValidationError(
                    f"This user account is registered as '{user_role}', not '{self.required_role}'. "
                    f"Please use the appropriate login endpoint."
                )
        
        data["role"] = self._resolve_role(self.user)
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = cls._resolve_role(user)
        return token


class CandidateTokenObtainPairSerializer(RoleAwareTokenObtainPairSerializer):
    """JWT login serializer for candidates"""
    required_role = 'candidate'


class CompanyTokenObtainPairSerializer(RoleAwareTokenObtainPairSerializer):
    """JWT login serializer for companies/employers"""
    required_role = 'company'


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Allow JWT login using either username or email in the username field."""

    @staticmethod
    def _resolve_role(user):
        """
        Resolve user role from Profile model.
        Falls back to CompanyProfile for backward compatibility.
        """
        try:
            if hasattr(user, 'profile'):
                return user.profile.role
        except Exception:
            pass
        
        # Fallback for backward compatibility
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
        required=True,
        write_only=True,
        help_text="User role: 'candidate' for job seekers, 'company' for employers"
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "confirm_password", "role")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email is already in use"})

        if not attrs.get("role"):
            raise serializers.ValidationError({"role": "Role selection is required (candidate or company)"})

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

        # Set role in Profile (created by signal)
        # Ensure profile exists and set role
        profile, created = Profile.objects.get_or_create(user=user)
        if profile.role != role:
            profile.role = role
            profile.save(update_fields=['role'])

        # If company role, also create CompanyProfile
        if role == "company":
            CompanyProfile.objects.get_or_create(
                user=user,
                defaults={"name": user.username},
            )
        
        return user


class CandidateRegisterSerializer(serializers.ModelSerializer):
    """Registration serializer for candidates"""
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

    class Meta:
        model = User
        fields = ("username", "email", "password", "confirm_password")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email is already in use"})

        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Username is already taken"})

        attrs.pop("confirm_password")
        return attrs

    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
        )
        user.set_password(validated_data["password"])
        user.save()

        # Ensure profile exists with candidate role
        profile, created = Profile.objects.get_or_create(user=user)
        if profile.role != 'candidate':
            profile.role = 'candidate'
            profile.save(update_fields=['role'])
        
        return user


class CompanyRegisterSerializer(serializers.ModelSerializer):
    """Registration serializer for companies/employers"""
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
    company_name = serializers.CharField(
        max_length=255,
        required=False,
        write_only=True,
        help_text="Company name (defaults to username if not provided)"
    )

    class Meta:
        model = User
        fields = ("username", "email", "password", "confirm_password", "company_name")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"password": "Passwords do not match"})

        if User.objects.filter(email=attrs["email"]).exists():
            raise serializers.ValidationError({"email": "Email is already in use"})

        if User.objects.filter(username=attrs["username"]).exists():
            raise serializers.ValidationError({"username": "Username is already taken"})

        attrs.pop("confirm_password")
        return attrs

    def create(self, validated_data):
        company_name = validated_data.pop("company_name", None)
        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
        )
        user.set_password(validated_data["password"])
        user.save()

        # Ensure profile exists with company role
        profile, created = Profile.objects.get_or_create(user=user)
        if profile.role != 'company':
            profile.role = 'company'
            profile.save(update_fields=['role'])

        # Create CompanyProfile
        CompanyProfile.objects.get_or_create(
            user=user,
            defaults={"name": company_name or user.username},
        )
        
        return user


class ProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)
    role = serializers.CharField(read_only=True)
    is_candidate = serializers.SerializerMethodField()
    is_company = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ["id", "user", "role", "is_candidate", "is_company", "bio", "location", "phone", "avatar", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "role", "is_candidate", "is_company", "created_at", "updated_at"]

    def get_is_candidate(self, obj):
        return obj.is_candidate
    
    def get_is_company(self, obj):
        return obj.is_company


class ProfileUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = ["bio", "location", "phone", "avatar"]
