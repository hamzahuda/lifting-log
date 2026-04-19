from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from unittest.mock import patch, MagicMock

User = get_user_model()


class UserModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
            email="test@test.com",
            supabase_id="mock-uuid-1234",
        )

    @patch("tracker.models.create_client")
    def testDeleteUserSupabaseSync(self, mock_create_client):

        mock_supabase = MagicMock()
        mock_create_client.return_value = mock_supabase

        self.user.delete()

        self.assertFalse(User.objects.filter(username="testuser").exists())

        mock_create_client.assert_called_once()
        mock_supabase.auth.admin.delete_user.assert_called_once_with("mock-uuid-1234")
