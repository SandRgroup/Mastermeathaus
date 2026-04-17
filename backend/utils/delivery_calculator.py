"""
Delivery fee calculator based on ZIP code distance and membership tier
"""
import os
import math
from typing import Optional, Tuple

# Headquarters location: 75238 (Dallas, TX)
HQ_ZIP = "75238"
HQ_COORDS = (32.8651, -96.7653)  # Approximate coordinates for 75238

# Standard delivery fee for non-members
STANDARD_DELIVERY_FEE = 24.99

# Simple ZIP code to coordinate mapping (Dallas area - expanded list)
ZIP_COORDS = {
    "75238": (32.8651, -96.7653),  # HQ
    "75218": (32.8412, -96.7003),  # ~5 miles
    "75228": (32.8223, -96.6892),  # ~6 miles
    "75217": (32.7845, -96.6842),  # ~8 miles
    "75206": (32.8290, -96.7745),  # ~4 miles
    "75214": (32.8456, -96.7412),  # ~2 miles
    "75231": (32.8890, -96.7534),  # ~3 miles
    "75243": (32.9123, -96.7689),  # ~5 miles
    "75080": (32.9567, -96.7234),  # ~10 miles
    "75081": (32.9678, -96.6345),  # ~12 miles
    "75082": (33.0145, -96.5678),  # ~15 miles
    "75001": (33.0234, -96.8123),  # ~18 miles
    "75002": (32.9890, -96.9012),  # ~20 miles
    "75019": (33.0567, -96.5234),  # ~22 miles
    "75023": (33.1234, -96.7890),  # ~25 miles
    "75024": (33.0890, -96.8456),  # ~27 miles
    "75025": (33.1567, -96.7123),  # ~30 miles
    "75034": (33.0123, -96.9678),  # ~35 miles
    "75035": (33.1890, -96.6234),  # ~38 miles
    "75050": (32.7234, -96.9123),  # ~18 miles
    "75051": (32.6890, -96.8456),  # ~22 miles
    "75060": (32.9234, -97.0567),  # ~28 miles
    "75061": (32.8567, -97.1234),  # ~32 miles
    "75062": (32.7890, -97.0890),  # ~30 miles
    "75067": (33.0345, -97.1567),  # ~40 miles
    "75068": (33.1123, -97.0234),  # ~42 miles
    "75069": (33.1678, -96.9890),  # ~45 miles
    "75070": (33.2234, -96.8567),  # ~48 miles
    "75071": (33.2890, -96.7234),  # ~50 miles
}

def calculate_distance(zip1: str, zip2: str) -> Optional[float]:
    """
    Calculate distance between two ZIP codes in miles using Haversine formula
    Returns None if ZIP code not found
    """
    if zip1 not in ZIP_COORDS or zip2 not in ZIP_COORDS:
        return None
    
    lat1, lon1 = ZIP_COORDS[zip1]
    lat2, lon2 = ZIP_COORDS[zip2]
    
    # Haversine formula
    R = 3959  # Earth's radius in miles
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c
    
    return round(distance, 2)

def calculate_delivery_fee(
    customer_zip: str,
    order_total: float,
    membership_tier: int = 0,
    membership_benefits: Optional[dict] = None
) -> Tuple[float, str, bool]:
    """
    Calculate delivery fee based on location, order total, and membership
    
    Args:
        customer_zip: Customer's ZIP code
        order_total: Total order amount
        membership_tier: Membership tier level (0=free, 1=premium, 2=elite, 3=ultimate)
        membership_benefits: Dictionary containing membership benefits
    
    Returns:
        Tuple of (delivery_fee, explanation, is_free)
    """
    
    distance = calculate_distance(HQ_ZIP, customer_zip)
    
    if distance is None:
        return STANDARD_DELIVERY_FEE, f"Standard delivery fee (ZIP code not in Dallas area)", False
    
    # No membership (Tier 0 - Free tier still has benefits!)
    if membership_tier == 0:
        if membership_benefits:
            delivery = membership_benefits.get("delivery", {})
            base_miles = delivery.get("base_free_miles", 0)
            
            # Free tier: Free delivery for orders $499+ within 5 miles
            if distance <= 5 and order_total >= 499:
                return 0.0, f"Free delivery (Order ${order_total:.2f} ≥ $499 within 5 miles)", True
            
            # Free tier: 50% off delivery for orders under $499 within 5 miles
            if distance <= 5 and order_total < 499:
                discounted_fee = STANDARD_DELIVERY_FEE * 0.5
                return discounted_fee, f"Local delivery discount: 50% off (${STANDARD_DELIVERY_FEE:.2f} → ${discounted_fee:.2f})", False
        
        return STANDARD_DELIVERY_FEE, f"Standard delivery fee ({distance} miles from HQ)", False
    
    # Premium/Elite tiers (Tier 1 & 2)
    if membership_tier in [1, 2] and membership_benefits:
        delivery = membership_benefits.get("delivery", {})
        base_miles = delivery.get("base_free_miles", 15)
        extended_miles = delivery.get("extended_free_miles", 10)
        threshold = delivery.get("order_threshold", 150)
        
        # Base free delivery
        if distance <= base_miles:
            return 0.0, f"Member free delivery (within {base_miles} miles)", True
        
        # Extended free delivery for orders over threshold
        total_free_miles = base_miles + extended_miles
        if order_total >= threshold and distance <= total_free_miles:
            return 0.0, f"Extended free delivery (Order ${order_total:.2f} ≥ ${threshold:.2f}, within {total_free_miles} miles)", True
        
        return STANDARD_DELIVERY_FEE, f"Outside free delivery zone ({distance} miles)", False
    
    # Ultimate tier (Tier 3)
    if membership_tier == 3 and membership_benefits:
        delivery = membership_benefits.get("delivery", {})
        base_miles = delivery.get("base_free_miles", 40)
        extended_miles = delivery.get("extended_free_miles", 10)
        threshold = delivery.get("order_threshold", 150)
        
        # Base free delivery
        if distance <= base_miles:
            return 0.0, f"Haus Prime free delivery (within {base_miles} miles)", True
        
        # Extended free delivery for orders over threshold
        total_free_miles = base_miles + extended_miles
        if order_total >= threshold and distance <= total_free_miles:
            return 0.0, f"Extended Haus Prime delivery (Order ${order_total:.2f} ≥ ${threshold:.2f}, within {total_free_miles} miles)", True
        
        return STANDARD_DELIVERY_FEE, f"Outside free delivery zone ({distance} miles)", False
    
    return STANDARD_DELIVERY_FEE, f"Standard delivery fee", False

def get_available_zips() -> list:
    """Return list of supported ZIP codes"""
    return list(ZIP_COORDS.keys())
