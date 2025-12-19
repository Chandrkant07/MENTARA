# Load Testing Guide

## Prerequisites
Install k6:
```bash
# Windows (with Chocolatey)
choco install k6

# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Running Load Tests

### Basic Test
```bash
k6 run load-test.js
```

### With Custom Base URL
```bash
k6 run -e BASE_URL=https://your-domain.com load-test.js
```

### Smoke Test (Quick Check)
```bash
k6 run --vus 1 --duration 30s load-test.js
```

### Stress Test (High Load)
```bash
k6 run --vus 500 --duration 5m load-test.js
```

### Output to File
```bash
k6 run --out json=test-results.json load-test.js
```

## Interpreting Results

### Key Metrics
- **http_req_duration**: How long requests take (target: p95 < 500ms)
- **http_req_failed**: Percentage of failed requests (target: < 1%)
- **vus**: Number of virtual users
- **iterations**: Total test iterations completed

### Good Performance Indicators
✅ p95 response time < 500ms
✅ Error rate < 1%
✅ Throughput > 100 req/s
✅ No memory leaks over time

### Warning Signs
⚠️ p95 > 1000ms: Database queries need optimization
⚠️ Error rate > 5%: Server stability issues
⚠️ Increasing response times: Memory leak or resource exhaustion

## Optimization Tips

### If response times are high:
1. Add database indexes
2. Enable query caching
3. Use select_related/prefetch_related
4. Add Redis caching layer

### If error rate is high:
1. Check server logs
2. Increase worker count
3. Add connection pooling
4. Scale horizontally

### If throughput is low:
1. Enable gzip compression
2. Use CDN for static assets
3. Optimize database connection pool
4. Add load balancer

## Continuous Monitoring

### Integrate with CI/CD
Add to GitHub Actions:
```yaml
- name: Load test
  run: |
    k6 run --vus 50 --duration 2m load-test.js
```

### Production Monitoring
Use tools like:
- Grafana + Prometheus
- New Relic
- DataDog
- Sentry for error tracking
