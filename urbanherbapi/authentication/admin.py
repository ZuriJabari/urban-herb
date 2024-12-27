from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, Address, UserPreferences, VerificationCode

class AddressInline(admin.TabularInline):
    model = Address
    extra = 0

class PreferencesInline(admin.TabularInline):
    model = UserPreferences
    extra = 0

class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'is_email_verified')
    list_filter = ('is_active', 'is_staff', 'is_email_verified')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-id',)
    inlines = [AddressInline, PreferencesInline]
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name', 'date_of_birth', 'profile_photo', 'bio', 'gender')}),
        (_('Verification'), {'fields': ('is_email_verified',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'first_name', 'last_name'),
        }),
    )

class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'street_address', 'city', 'state', 'country', 'is_default')
    list_filter = ('is_default', 'country', 'state')
    search_fields = ('user__email', 'street_address', 'city', 'state', 'country')

class PreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'language', 'currency', 'timezone', 'theme')
    list_filter = ('language', 'currency', 'theme')
    search_fields = ('user__email',)

class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'is_used', 'created_at')
    list_filter = ('is_used',)
    search_fields = ('email',)
    readonly_fields = ('code', 'created_at')

admin.site.register(User, CustomUserAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(UserPreferences, PreferencesAdmin)
admin.site.register(VerificationCode, VerificationCodeAdmin)
