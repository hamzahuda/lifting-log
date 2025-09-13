# authentication.py

from rest_framework import authentication, exceptions
import jwt
from jwt import PyJWKClient
from django.conf import settings
from django.contrib.auth import get_user_model


class SupabaseAuthentication(authentication.BaseAuthentication):

    def authenticate(self, request):

        # Check if auth header is in format "Bearer <token>"
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None
        try:
            auth_type, token = auth_header.split()
            if auth_type.lower() != "bearer":
                return None
        except ValueError:
            raise exceptions.AuthenticationFailed(
                "Invalid Authorization header format. Expected 'Bearer <token>'."
            )

        # Verify JWT token using Supabase's JWKS endpoint
        try:
            jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
            jwks_client = PyJWKClient(uri=jwks_url, cache_jwk_set=True, lifespan=600)
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256"],
                audience=settings.SUPABASE_AUDIENCE,
            )

            # Get or create user based on Supabase user ID
            supabase_id = payload.get("sub")
            if not supabase_id:
                raise exceptions.AuthenticationFailed(
                    "Invalid token: User ID ('sub') not found."
                )

            User = get_user_model()
            email = payload.get("email")
            try:
                user = User.objects.get(supabase_id=supabase_id)
                return (user, token)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(email=email)
                    user.supabase_id = supabase_id
                    user.save()
                    return (user, token)
                except User.DoesNotExist:
                    user = User.objects.create(
                        supabase_id=supabase_id,
                        email=email,
                    )
                    return (user, token)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError as e:
            raise exceptions.AuthenticationFailed(f"Invalid token: {str(e)}")
        except Exception as e:
            print(str(e))  # For debugging purposes
            raise exceptions.AuthenticationFailed("Could not authenticate token.")
