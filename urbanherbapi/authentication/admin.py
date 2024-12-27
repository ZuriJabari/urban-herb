from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from .models import Address, UserPreferences, VerificationCode

User = get_user_model()

class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'phone_number', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_phone_verified')
    list_filter = ('is_active', 'is_staff', 'is_phone_verified')
    search_fields = ('phone_number', 'email', 'first_name', 'last_name')
    ordering = ('-id',)
    
    fieldsets = (
        (None, {'fields': ('phone_number', 'email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Verification', {'fields': ('is_phone_verified',)}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'email', 'password1', 'password2'),
        }),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Address)
admin.site.register(UserPreferences)
admin.site.register(VerificationCode)
