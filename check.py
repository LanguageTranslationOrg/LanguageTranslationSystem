import re

def validate_english_string(s):
    english_regex = re.compile(r'^[\w\s.,;?!\'\"@#%&*()\[\]{}\-]+$')
    if not english_regex.match(s):
        raise ValueError("String contains non-English characters")
    return True

# Example usage:
try:
    validate_english_string("hiపాఠ్యాన్ని నమోదు చేయండి")     # Invalid (contains non-English characters)
except ValueError as e:
    print(e)  # Output: String contains non-English characters
