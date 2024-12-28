from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.utils.translation import gettext_lazy as _
from .models import User, Address, UserPreferences, VerificationCode

class AddressInline(admin.TabularInline):
    model = Address
    extra = 0

class PreferencesInline(admin.TabularInline):
    model = UserPreferences
    extra = 0

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ('email', 'first_name', 'last_name')
        
class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User
        fields = ('email', 'first_name', 'last_name')

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    
    list_display = ('email', 'first_name', 'last_name', 'is_staff', 'is_active', 'is_email_verified')
    list_filter = ('is_staff', 'is_active', 'is_email_verified')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal info'), {'fields': ('first_name', 'last_name')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified'),
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'is_staff', 'is_active', 'is_email_verified'),
        }),
    )
    
    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)

class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'street_address', 'city', 'state', 'country', 'is_default')
    list_filter = ('is_default', 'country', 'state')
    search_fields = ('user__email', 'street_address', 'city', 'state', 'country')

class PreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'language', 'currency', 'timezone', 'theme')
    list_filter = ('language', 'currency', 'theme')
    search_fields = ('user__email',)

class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('email', 'code', 'is_used', 'is_expired', 'created_at', 'expires_at')
    list_filter = ('is_used', 'created_at', 'expires_at')
    search_fields = ('email', 'code')
    readonly_fields = ('code', 'created_at', 'expires_at')
    ordering = ('-created_at',)
    
    def is_expired(self, obj):
        from django.utils import timezone
        return obj.expires_at <= timezone.now()
    is_expired.boolean = True
    is_expired.short_description = 'Expired'
    
    def has_add_permission(self, request):
        return False  # Prevent manual creation of verification codes

admin.site.register(Address, AddressAdmin)
admin.site.register(UserPreferences, PreferencesAdmin)
admin.site.register(VerificationCode, VerificationCodeAdmin)
