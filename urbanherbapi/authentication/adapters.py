from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        """
        Saves a new `User` instance using information provided in the
        registration form.
        """
        data = form.cleaned_data
        user.email = data.get('email')
        user.first_name = data.get('first_name', '')
        user.last_name = data.get('last_name', '')
        user.phone_number = data.get('phone_number', '')
        
        if 'password1' in data:
            user.set_password(data["password1"])
        else:
            user.set_unusable_password()
            
        self.populate_username(request, user)
            
        if commit:
            user.save()
            
        return user
    
    def populate_username(self, request, user):
        """
        Override the populate_username since we don't use usernames
        """
        pass
