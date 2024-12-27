import re

def validate_phone_number(phone_number):
    """Validate and format phone number"""
    # Remove any whitespace, dots, or hyphens
    cleaned_number = re.sub(r'[\s\.\-]', '', phone_number)
    
    # Make sure it starts with +
    if not cleaned_number.startswith('+'):
        if cleaned_number.startswith('0'):  # Convert local Uganda format
            cleaned_number = '+256' + cleaned_number[1:]
        else:
            cleaned_number = '+256' + cleaned_number
    
    # Check if it matches the E.164 format (+ followed by digits)
    if not re.match(r'^\+\d{10,15}$', cleaned_number):
        return False, "Phone number must be in E.164 format (+XXX...) and contain 10-15 digits"
    
    # Validate country code (basic check)
    country_code = cleaned_number[1:4]  # Get first 3 digits after +
    if not (country_code.isdigit() and int(country_code) > 0):
        return False, "Invalid country code"
    
    return True, cleaned_number
