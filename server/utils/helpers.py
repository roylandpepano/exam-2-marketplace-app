import os
from werkzeug.utils import secure_filename
from flask import current_app
from PIL import Image
import uuid


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def save_image(file, folder='products', max_size=(1200, 1200)):
    """
    Save uploaded image file.
    
    Args:
        file: FileStorage object
        folder: Subfolder in uploads directory
        max_size: Tuple of (width, height) for max dimensions
    
    Returns:
        str: Relative path to saved file
    """
    if not file or not allowed_file(file.filename):
        return None
    
    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    
    # Create folder if it doesn't exist
    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], folder)
    os.makedirs(upload_path, exist_ok=True)
    
    # Full path
    filepath = os.path.join(upload_path, filename)
    
    # Save and optimize image
    try:
        image = Image.open(file)
        
        # Convert RGBA to RGB if needed
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        
        # Resize if larger than max_size
        if image.size[0] > max_size[0] or image.size[1] > max_size[1]:
            image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save with optimization
        image.save(filepath, optimize=True, quality=85)
        
    except Exception as e:
        print(f"Error processing image: {e}")
        # Fall back to direct save
        file.seek(0)
        file.save(filepath)
    
    # Return relative path
    return f"{folder}/{filename}"


def delete_image(image_path):
    """Delete image file."""
    if not image_path:
        return
    
    try:
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], image_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception as e:
        print(f"Error deleting image: {e}")


def generate_slug(text):
    """Generate URL-friendly slug from text."""
    import re
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')
