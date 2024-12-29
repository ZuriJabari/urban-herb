from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny, IsAuthenticatedOrReadOnly
from django.db.models import Q, Avg, Count
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from django.http import Http404

from .models import Product, Brand, ProductImage, Review, Cart, CartItem, Wishlist, CBDEffect
from .serializers import (
    ProductSerializer, BrandSerializer, ProductImageSerializer,
    ReviewSerializer, ReviewCreateSerializer, CartItemSerializer,
    CartSerializer, WishlistSerializer, CBDEffectSerializer,
    ProductCreateUpdateSerializer
)

# Create your views here.

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Allow public access to products
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description', 'category']
    filterset_fields = ['category', 'strain', 'featured']
    
    def get_queryset(self):
        try:
            print("Starting get_queryset")
            queryset = Product.objects.all()
            print(f"Initial product count: {queryset.count()}")
            
            # Add select_related and prefetch_related with error handling
            try:
                queryset = queryset.select_related('brand').prefetch_related(
                    'images', 
                    'effects', 
                    'reviews'
                )
            except Exception as e:
                print(f"Error in select_related/prefetch_related: {str(e)}")
                # Continue without the related fields if there's an error
            
            # Add annotations with error handling
            try:
                queryset = queryset.annotate(
                    average_rating=Avg('reviews__rating'),
                    review_count=Count('reviews')
                )
            except Exception as e:
                print(f"Error in annotations: {str(e)}")
                # Continue without annotations if there's an error
            
            print(f"Final product count: {queryset.count()}")
            return queryset
            
        except Exception as e:
            print(f"Error in get_queryset: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return Product.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            print(f"Products found: {queryset.count()}")
            
            # Apply any filters
            queryset = self.filter_queryset(queryset)
            print(f"Products after filtering: {queryset.count()}")
            
            # Get page if paginated
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            # Otherwise return all
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            print(f"Error in list view: {str(e)}")
            return Response(
                {'error': 'Failed to fetch products', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
            
        except Http404:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"Error in retrieve: {str(e)}")
            return Response(
                {'error': 'Failed to fetch product', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def reviews(self, request, slug=None):
        try:
            product = self.get_object()
            reviews = Review.objects.filter(product=product)
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in reviews action: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        print(f"ProductViewSet: Getting related products for slug: {slug}")
        try:
            product = self.get_object()
            # Get products in the same category
            related_products = Product.objects.filter(
                category=product.category
            ).exclude(
                id=product.id
            )[:4]
            serializer = ProductSerializer(related_products, many=True)
            return Response(serializer.data)
        except Exception as e:
            print(f"ProductViewSet: Error getting related products: {str(e)}")
            return Response(
                {'error': 'Failed to get related products'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        quantity = request.data.get('quantity', 0)

        try:
            quantity = int(quantity)
            if quantity <= 0:
                raise ValueError()
        except ValueError:
            return Response(
                {'error': 'Quantity must be a positive integer'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if product.stock < quantity:
            return Response(
                {'error': 'Not enough stock available'},
                status=status.HTTP_400_BAD_REQUEST
            )

        product.stock -= quantity
        product.save()

        serializer = self.get_serializer(product)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        return Response(Product.category.field.choices)

    @action(detail=False, methods=['get'])
    def effects(self, request):
        return Response([choice[0] for choice in Product._meta.get_field('effects').choices])

class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return ProductImage.objects.filter(product_id=self.kwargs['product_pk'])

    def perform_create(self, serializer):
        product = Product.objects.get(pk=self.kwargs['product_pk'])
        serializer.save(product=product)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        print("ReviewViewSet: Getting reviews")
        slug = self.kwargs.get('slug')
        if not slug:
            return Review.objects.none()
        
        try:
            product = Product.objects.get(slug=slug)
            print(f"ReviewViewSet: Found product {product.name}, returning reviews")
            return Review.objects.filter(product=product).select_related('user')
        except Product.DoesNotExist:
            print(f"ReviewViewSet: Product with slug {slug} not found")
            return Review.objects.none()

    def perform_create(self, serializer):
        print("ReviewViewSet: Creating review")
        slug = self.kwargs.get('slug')
        try:
            product = Product.objects.get(slug=slug)
            print(f"ReviewViewSet: Found product {product.name}, creating review")
            serializer.save(user=self.request.user, product=product)
        except Product.DoesNotExist:
            print(f"ReviewViewSet: Product with slug {slug} not found")
            raise NotFound('Product not found')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReviewCreateSerializer
        return ReviewSerializer

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get cart for current user"""
        print(f"CartViewSet: Getting cart for user {self.request.user.email}")
        return Cart.objects.filter(user=self.request.user).prefetch_related('items__product')

    def perform_create(self, serializer):
        """Create cart for current user"""
        print(f"CartViewSet: Creating cart for user {self.request.user.email}")
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current user's cart"""
        print(f"CartViewSet: Getting current cart for user {request.user.email}")
        try:
            cart = self.get_queryset().first()
            if not cart:
                print(f"CartViewSet: No cart found, creating new one for user {request.user.email}")
                cart = Cart.objects.create(user=request.user)
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
        except Exception as e:
            print(f"CartViewSet: Error getting current cart: {str(e)}")
            return Response(
                {'error': 'Failed to get cart'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def add(self, request):
        """Add item to cart"""
        print(f"CartViewSet: Adding item to cart for user {request.user.email}")
        try:
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))
            
            if not product_id:
                return Response(
                    {'error': 'Product ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create cart
            cart, created = Cart.objects.get_or_create(user=request.user)
            if created:
                print(f"CartViewSet: Created new cart for user {request.user.email}")
            
            # Get product
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                print(f"CartViewSet: Product {product_id} not found")
                return Response(
                    {'error': 'Product not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if product is already in cart
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                print(f"CartViewSet: Updating existing cart item quantity")
                cart_item.quantity += quantity
                cart_item.save()
            else:
                print(f"CartViewSet: Created new cart item")
            
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
            
        except ValueError:
            print(f"CartViewSet: Invalid quantity provided")
            return Response(
                {'error': 'Invalid quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"CartViewSet: Error adding item to cart: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def remove(self, request):
        """Remove item from cart"""
        print(f"CartViewSet: Removing item from cart for user {request.user.email}")
        try:
            product_id = request.data.get('product_id')
            if not product_id:
                return Response(
                    {'error': 'Product ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart = Cart.objects.get(user=request.user)
            CartItem.objects.filter(cart=cart, product_id=product_id).delete()
            print(f"CartViewSet: Successfully removed item {product_id} from cart")
            
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
            
        except Cart.DoesNotExist:
            print(f"CartViewSet: Cart not found for user {request.user.email}")
            return Response(
                {'error': 'Cart not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"CartViewSet: Error removing item from cart: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        """Update item quantity"""
        print(f"CartViewSet: Updating quantity for user {request.user.email}")
        try:
            product_id = request.data.get('product_id')
            quantity = int(request.data.get('quantity', 1))
            
            if not product_id:
                return Response(
                    {'error': 'Product ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart = Cart.objects.get(user=request.user)
            cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
            cart_item.quantity = quantity
            cart_item.save()
            print(f"CartViewSet: Successfully updated quantity for item {product_id}")
            
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
            
        except (Cart.DoesNotExist, CartItem.DoesNotExist):
            print(f"CartViewSet: Item not found in cart")
            return Response(
                {'error': 'Item not found in cart'},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError:
            print(f"CartViewSet: Invalid quantity provided")
            return Response(
                {'error': 'Invalid quantity'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            print(f"CartViewSet: Error updating quantity: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear cart"""
        print(f"CartViewSet: Clearing cart for user {request.user.email}")
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            print(f"CartViewSet: Successfully cleared cart")
            
            serializer = self.get_serializer(cart)
            return Response(serializer.data)
            
        except Cart.DoesNotExist:
            print(f"CartViewSet: Cart not found for user {request.user.email}")
            return Response(
                {'error': 'Cart not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"CartViewSet: Error clearing cart: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        
        if product in wishlist.products.all():
            wishlist.products.remove(product)
            is_wishlisted = False
        else:
            wishlist.products.add(product)
            is_wishlisted = True

        return Response({'is_wishlisted': is_wishlisted})

    @action(detail=False, methods=['get'])
    def check(self, request, product_id=None):
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        wishlist = Wishlist.objects.filter(user=request.user).first()
        is_wishlisted = wishlist and product in wishlist.products.all()

        return Response({'is_wishlisted': is_wishlisted})

    @action(detail=True, methods=['post'])
    def add_product(self, request, pk=None):
        wishlist = self.get_object()
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        wishlist.products.add(product)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def remove_product(self, request, pk=None):
        wishlist = self.get_object()
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        wishlist.products.remove(product)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def move_to_cart(self, request, pk=None):
        wishlist = self.get_object()
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'product_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = wishlist.products.get(id=product_id)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found in wishlist'}, status=status.HTTP_404_NOT_FOUND)

        cart, created = Cart.objects.get_or_create(user=request.user)
        CartItem.objects.get_or_create(cart=cart, product=product)
        wishlist.products.remove(product)

        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

class CBDEffectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CBDEffect.objects.all()
    serializer_class = CBDEffectSerializer
    permission_classes = [AllowAny]
