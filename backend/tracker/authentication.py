from django.contrib.auth.models import User
from rest_framework import authentication, exceptions
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model


class SupabaseAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        try:
            auth_type, token = auth_header.split()
            if auth_type.lower() != "bearer":
                return None
        except ValueError:
            raise exceptions.AuthenticationFailed(
                "Invalid Authorization header format."
            )

        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
            )

            user_id = payload.get("sub")
            if not user_id:
                raise exceptions.AuthenticationFailed(
                    "Invalid token: user ID not found."
                )

            User = get_user_model()
            user, created = User.objects.get_or_create(
                supabase_id=user_id,
                defaults={
                    "email": payload.get("email", ""),
                },
            )
            return (user, token)

        except Exception as e:
            raise exceptions.AuthenticationFailed("Invalid token: " + str(e))
