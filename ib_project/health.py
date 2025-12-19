from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import os

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

@csrf_exempt
def health_check(request):
    """
    Health check endpoint for monitoring and load balancers.
    Returns 200 if all systems operational, 503 if any critical service is down.
    """
    health_status = {
        'status': 'healthy',
        'checks': {}
    }
    
    http_status = 200
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['checks']['database'] = 'ok'
    except Exception as e:
        health_status['checks']['database'] = f'error: {str(e)}'
        health_status['status'] = 'unhealthy'
        http_status = 503
    
    # Check Redis connection (if configured)
    try:
        redis_url = os.getenv('REDIS_URL')
        if REDIS_AVAILABLE and redis_url and not os.getenv('DEBUG', 'True') == 'True':
            r = redis.from_url(redis_url)
            r.ping()
            health_status['checks']['redis'] = 'ok'
        else:
            health_status['checks']['redis'] = 'skipped (dev mode or not installed)'
    except Exception as e:
        health_status['checks']['redis'] = f'error: {str(e)}'
        # Redis is optional, don't mark as unhealthy
    
    # Add application version (optional)
    health_status['version'] = os.getenv('APP_VERSION', 'dev')
    
    return JsonResponse(health_status, status=http_status)
