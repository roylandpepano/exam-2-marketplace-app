from app import create_app

# Create the WSGI application for production servers (gunicorn)
app = create_app()
