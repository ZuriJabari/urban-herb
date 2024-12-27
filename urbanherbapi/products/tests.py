from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Product, Brand, Review, ProductCategory, StrainType, ProductEffect
from .serializers import ProductSerializer, BrandSerializer, ReviewSerializer

User = get_user_model()

class ProductTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Clean up any existing data
        User.objects.all().delete()
        Brand.objects.all().delete()
        Product.objects.all().delete()
        Review.objects.all().delete()

    def setUp(self):
        self.user = User.objects.create_user(
            email='product_test_user@example.com',
            password='testpass123',
            phone_number='+256700000001',
            is_active=True,
            is_email_verified=True,
            is_phone_verified=True
        )
        self.admin_user = User.objects.create_superuser(
            email='product_test_admin@example.com',
            password='adminpass123',
            phone_number='+256700000002'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            website='https://testbrand.com',
            description='Test brand description'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Test description',
            brand=self.brand,
            category=ProductCategory.TINCTURES,
            price=29.99,
            stock=100,
            strain=StrainType.HYBRID,
            thc_content='0.0',
            cbd_content='5.0',
            effects=[ProductEffect.RELAXING, ProductEffect.CALMING],
            benefits=['Test benefit'],
            weight='30ml',
            dosage='1-2 drops',
            lab_tested=True
        )

    def test_get_products_list(self):
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Product')

    def test_get_product_detail(self):
        url = reverse('product-detail', kwargs={'pk': self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Product')
        self.assertEqual(response.data['rating'], 0)  # No reviews yet
        self.assertEqual(response.data['review_count'], 0)  # No reviews yet

    def test_create_product_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'New description',
            'brand': self.brand.id,
            'category': ProductCategory.CAPSULES,
            'price': 19.99,
            'stock': 50,
            'strain': StrainType.SATIVA,
            'thc_content': '0.0',
            'cbd_content': '10.0',
            'effects': [ProductEffect.ENERGIZING],
            'benefits': ['New benefit'],
            'weight': '60 capsules',
            'dosage': '1 capsule',
            'lab_tested': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)

    def test_create_product_as_regular_user(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('product-list')
        data = {
            'name': 'New Product',
            'description': 'New description',
            'brand': self.brand.id,
            'category': ProductCategory.CAPSULES,
            'price': 19.99,
            'stock': 50,
            'cbd_content': '10.0',
            'lab_tested': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_search_products(self):
        url = reverse('product-list')
        response = self.client.get(url, {'search': 'Test'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Product')

    def test_filter_products(self):
        url = reverse('product-list')
        response = self.client.get(url, {
            'category': ProductCategory.TINCTURES,
            'min_price': 20,
            'max_price': 30
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test Product')

class BrandTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Clean up any existing data
        User.objects.all().delete()
        Brand.objects.all().delete()
        Product.objects.all().delete()
        Review.objects.all().delete()

    def setUp(self):
        self.user = User.objects.create_user(
            email='brand_test_user@example.com',
            password='testpass123',
            phone_number='+256700000003',
            is_active=True
        )
        self.admin_user = User.objects.create_superuser(
            email='brand_test_admin@example.com',
            password='adminpass123',
            phone_number='+256700000004'
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            website='https://testbrand.com',
            description='Test brand description'
        )

    def test_get_brands_list(self):
        url = reverse('brand-list')
        response = self.client.get(url)
        brands = Brand.objects.all()
        serializer = BrandSerializer(brands, many=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, serializer.data)

    def test_create_brand_as_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('brand-list')
        data = {
            'name': 'New Brand',
            'website': 'https://newbrand.com',
            'description': 'New brand description'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Brand.objects.count(), 2)

class ReviewTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        # Clean up any existing data
        User.objects.all().delete()
        Brand.objects.all().delete()
        Product.objects.all().delete()
        Review.objects.all().delete()

    def setUp(self):
        self.user = User.objects.create_user(
            email='review_test_user@example.com',
            password='testpass123',
            phone_number='+256700000005',
            is_active=True
        )
        self.brand = Brand.objects.create(
            name='Test Brand',
            website='https://testbrand.com',
            description='Test brand description'
        )
        self.product = Product.objects.create(
            name='Test Product',
            description='Test description',
            brand=self.brand,
            category=ProductCategory.TINCTURES,
            price=29.99,
            stock=100,
            strain=StrainType.HYBRID,
            thc_content='0.0',
            cbd_content='5.0',
            effects=[ProductEffect.RELAXING],
            benefits=['Test benefit'],
            weight='30ml',
            dosage='1-2 drops',
            lab_tested=True
        )

    def test_create_review(self):
        self.client.force_authenticate(user=self.user)
        url = reverse('product-reviews-list', kwargs={'product_pk': self.product.pk})
        data = {
            'rating': 5,
            'title': 'Great product',
            'comment': 'Really works well'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Review.objects.count(), 1)
        self.assertEqual(Review.objects.first().rating, 5)

        # Test product rating and review count
        self.product.refresh_from_db()
        self.assertEqual(self.product.rating, 5.0)
        self.assertEqual(self.product.review_count, 1)

    def test_get_product_reviews(self):
        Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            title='Test Review',
            comment='Test comment'
        )
        url = reverse('product-reviews-list', kwargs={'product_pk': self.product.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['rating'], 5)

    def test_delete_own_review(self):
        review = Review.objects.create(
            product=self.product,
            user=self.user,
            rating=5,
            title='Test Review',
            comment='Test comment'
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('product-reviews-detail', kwargs={
            'product_pk': self.product.pk,
            'pk': review.pk
        })
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Review.objects.count(), 0)

    def test_delete_others_review(self):
        other_user = User.objects.create_user(
            email='review_test_other@example.com',
            password='otherpass123',
            phone_number='+256700000006',
            is_active=True
        )
        review = Review.objects.create(
            product=self.product,
            user=other_user,
            rating=5,
            title='Test Review',
            comment='Test comment'
        )
        self.client.force_authenticate(user=self.user)
        url = reverse('product-reviews-detail', kwargs={
            'product_pk': self.product.pk,
            'pk': review.pk
        })
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Review.objects.count(), 1)
