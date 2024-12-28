from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from authentication.models import User
from django.utils.text import slugify
import json

class Brand(models.Model):
    name = models.CharField(max_length=100)
    logo = models.URLField(blank=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    CATEGORY_CHOICES = [
        ('FLOWERS', 'Flowers'),
        ('EDIBLES', 'Edibles'),
        ('CONCENTRATES', 'Concentrates'),
        ('VAPES', 'Vapes'),
        ('TINCTURES', 'Tinctures'),
        ('TOPICALS', 'Topicals'),
        ('ACCESSORIES', 'Accessories'),
        ('PRE_ROLLS', 'Pre-Rolls'),
        ('SEEDS', 'Seeds'),
    ]

    STRAIN_CHOICES = [
        ('SATIVA', 'Sativa'),
        ('INDICA', 'Indica'),
        ('HYBRID', 'Hybrid'),
        ('CBD', 'CBD'),
        ('NA', 'Not Applicable'),
    ]

    EFFECT_CHOICES = [
        ('RELAXING', 'Relaxing'),
        ('ENERGIZING', 'Energizing'),
        ('CREATIVE', 'Creative'),
        ('SLEEPY', 'Sleepy'),
        ('FOCUSED', 'Focused'),
        ('UPLIFTED', 'Uplifted'),
        ('HAPPY', 'Happy'),
        ('PAIN_RELIEF', 'Pain Relief'),
        ('STRESS_RELIEF', 'Stress Relief'),
        ('ANXIETY_RELIEF', 'Anxiety Relief'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    strain = models.CharField(max_length=20, choices=STRAIN_CHOICES, default='NA')
    thc_content = models.CharField(max_length=20, blank=True)
    cbd_content = models.CharField(max_length=20, blank=True)
    effects = models.TextField(blank=True)  # Store as JSON string
    benefits = models.TextField(blank=True)  # Store as JSON string
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.IntegerField(default=0)
    lab_tested = models.BooleanField(default=False)
    weight = models.CharField(max_length=20, blank=True)
    dosage = models.CharField(max_length=100, blank=True)
    ingredients = models.TextField(blank=True)
    usage_instructions = models.TextField(blank=True)
    warning = models.TextField(blank=True)
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        default=0
    )
    review_count = models.IntegerField(default=0)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    def set_effects(self, effects_list):
        self.effects = json.dumps(effects_list)

    def get_effects(self):
        if self.effects:
            return json.loads(self.effects)
        return []

    def set_benefits(self, benefits_list):
        self.benefits = json.dumps(benefits_list)

    def get_benefits(self):
        if self.benefits:
            return json.loads(self.benefits)
        return []

    class Meta:
        ordering = ['-created_at']

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.URLField()
    alt_text = models.CharField(max_length=200)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Review for {self.product.name} by {self.user.email}"

    class Meta:
        ordering = ['-created_at']
        unique_together = ('product', 'user')

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.email}"

    def get_total(self):
        return sum(item.get_subtotal() for item in self.items.all())

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name}"

    def get_subtotal(self):
        return self.product.price * self.quantity

class Wishlist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    products = models.ManyToManyField(Product)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wishlist for {self.user.email}"
