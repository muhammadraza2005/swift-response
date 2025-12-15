# How to Test Concurrency in Swift Response

## 🎯 Quick Verification (5 minutes)

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Open Volunteer Page
1. Navigate to `http://localhost:3000/volunteer`
2. Login if needed
3. Look for the **purple "Concurrency Cache" box** on the left sidebar

### Step 3: Watch Cache Stats Update
The cache stats will update automatically:
- **First load:** You'll see cache misses increase (fetching from database)
- **Refresh page:** You'll see cache hits increase (data from cache)
- **Hit Rate:** Should increase to 70-90% after a few refreshes

**Expected Result:**
```
⚡ Concurrency Cache
Cache Hits: 5
Cache Misses: 2
Hit Rate: 71.4%
```

---

## 🔬 Deep Testing

### Test 1: Cache Performance (Shared-Memory Safe)

Open browser console (F12) and run:

```javascript
// Test 1: Verify cache is working
console.clear();
console.log('🧪 Test 1: Cache Performance');

// Force a page refresh - watch the cache stats box
location.reload();

// After reload, you should see:
// - Cache Hits increasing
// - Hit Rate improving
```

### Test 2: Race Detection (Open Console)

The race detector automatically logs warnings when it detects potential issues:

```javascript
// In browser console - simulate rapid updates
console.clear();
console.log('🧪 Test 2: Race Detection');

// Rapidly click volunteer on the same request multiple times
// You should see console warnings if race conditions occur:
// ⚠️ Potential race condition detected on resource: cache:req-xxx
```

### Test 3: Message-Passing System

Open browser console and check for actor logs:

```javascript
console.clear();
console.log('🧪 Test 3: Message-Passing');

// When you volunteer for a request, you should see:
// [Notification Actor] Processing: status_changed for request req-xxx
// [Notification Actor] Sent status_changed notification for req-xxx
// [Logger Actor] Event: { timestamp, type, requestId, ... }
```

### Test 4: Concurrent Operations Protection

Open browser console and run this test:

```javascript
console.clear();
console.log('🧪 Test 4: Concurrent Operations');

// Try to trigger multiple fetches quickly
const testConcurrency = async () => {
  console.log('Starting 5 rapid refreshes...');
  
  for (let i = 0; i < 5; i++) {
    console.log(`Refresh ${i + 1}`);
    location.reload();
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};

// This should be protected by ConcurrentOperationTracker
// Only one operation should process at a time
```

---

## 📊 What to Look For

### ✅ Working Signs

1. **Cache Stats Box Visible**
   - Purple/blue gradient box in left sidebar
   - Shows hits, misses, and hit rate
   - Numbers update when you refresh

2. **Console Logs (F12 → Console)**
   ```
   [Notification Actor] Processing: created for request req-123
   [Logger Actor] Event: { type: 'created', requestId: 'req-123', ... }
   ```

3. **Race Detection Warnings (if triggered)**
   ```
   ⚠️ Potential race condition detected on resource: cache:req-123
   Operations: write and write
   Time difference: 45ms
   ```

4. **Smooth Performance**
   - Page loads faster after first visit (cache working)
   - No duplicate requests in Network tab
   - No UI freezing

### ❌ Problem Signs

1. **No Cache Stats Box**
   - Check browser console for errors
   - Verify imports in volunteer page

2. **Cache Stats Always Zero**
   - Check console for errors
   - Verify cache is being used in fetchData

3. **No Console Logs**
   - Check if NODE_ENV is development
   - Verify actors are initialized

---

## 🧪 Advanced Testing

### Test Concurrent Cache Access

Create a test file: `src/utils/concurrency/__tests__/manual-test.ts`

```typescript
import { emergencyRequestCache } from '@/utils/cache/emergencyCache';

async function testConcurrentAccess() {
  console.log('🧪 Testing concurrent cache access...');
  
  // Create test data
  const testRequest = {
    id: 'test-123',
    type: 'Medical',
    status: 'pending',
    // ... other fields
  };
  
  // Test 1: Concurrent writes (should be protected by lock)
  console.log('\n1. Testing concurrent writes...');
  await Promise.all([
    emergencyRequestCache.set('test-1', testRequest),
    emergencyRequestCache.set('test-2', testRequest),
    emergencyRequestCache.set('test-3', testRequest),
  ]);
  console.log('✅ Concurrent writes completed safely');
  
  // Test 2: Concurrent reads (should be fast)
  console.log('\n2. Testing concurrent reads...');
  const start = Date.now();
  await Promise.all([
    emergencyRequestCache.get('test-1'),
    emergencyRequestCache.get('test-2'),
    emergencyRequestCache.get('test-3'),
  ]);
  const duration = Date.now() - start;
  console.log(`✅ Concurrent reads completed in ${duration}ms`);
  
  // Test 3: Get stats
  console.log('\n3. Cache statistics:');
  const stats = await emergencyRequestCache.getStats();
  console.log(stats);
}

// Run in browser console:
// testConcurrentAccess();
```

### Test Race Detection

```typescript
import { globalRaceDetector } from '@/utils/concurrency/raceDetection';

async function testRaceDetection() {
  console.log('🧪 Testing race detection...');
  
  // Enable detection
  globalRaceDetector.setEnabled(true);
  
  // Simulate rapid concurrent writes (should trigger warning)
  const testResource = 'test-resource';
  
  console.log('\n1. Simulating race condition...');
  globalRaceDetector.recordAccess(testResource, 'write');
  
  // Small delay
  await new Promise(resolve => setTimeout(resolve, 10));
  
  globalRaceDetector.recordAccess(testResource, 'write');
  
  console.log('✅ Check console for race condition warning');
  
  // Get access log
  console.log('\n2. Access log:');
  const log = globalRaceDetector.getAccessLog(testResource);
  console.log(log);
}

// Run in browser console:
// testRaceDetection();
```

---

## 🎬 Video Walkthrough Checklist

### Before Recording
- [ ] App is running (`npm run dev`)
- [ ] Logged in as a user
- [ ] Browser console open (F12)
- [ ] Network tab open

### Recording Steps
1. Navigate to `/volunteer` page
2. Point to the purple "Concurrency Cache" box
3. Show initial stats (likely all zeros)
4. Refresh the page (Ctrl+R / Cmd+R)
5. Show cache stats updating
6. Open console and show actor logs
7. Volunteer for a request
8. Show status change event logs
9. Refresh again and show improved hit rate

### Expected Behavior
```
Initial Load:
  Cache Hits: 0
  Cache Misses: 5
  Hit Rate: 0%

After 1st Refresh:
  Cache Hits: 3
  Cache Misses: 5
  Hit Rate: 37.5%

After 3rd Refresh:
  Cache Hits: 12
  Cache Misses: 5
  Hit Rate: 70.6%
```

---

## 🐛 Troubleshooting

### Issue: Cache Stats Box Not Visible

**Check:**
```typescript
// In volunteer page.tsx, verify these imports exist:
import { emergencyRequestCache } from '@/utils/cache/emergencyCache';
import { emergencyUpdateCoordinator } from '@/utils/messaging/emergencyEvents';
import { ConcurrentOperationTracker } from '@/utils/concurrency/raceDetection';
```

**Solution:**
```bash
# Restart dev server
npm run dev
```

### Issue: Cache Stats Always Zero

**Check Console for Errors:**
1. Open F12 → Console
2. Look for red error messages
3. Check if cache functions are being called

**Debug in fetchData:**
```typescript
// Add this temporarily to fetchData function:
console.log('📦 Cache stats:', await emergencyRequestCache.getStats());
```

### Issue: No Actor Logs

**Enable Debug Logging:**
```typescript
// In src/utils/messaging/emergencyEvents.ts
// The console.log statements should already be there
// Make sure they're not commented out
```

**Check:**
1. Are events being published?
2. Is NODE_ENV = 'development'?
3. Check browser console filters (show all logs)

### Issue: Race Detection Not Working

**Enable Manually:**
```typescript
// In src/app/volunteer/page.tsx, add to useEffect:
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    globalRaceDetector.setEnabled(true);
    console.log('✅ Race detector enabled');
  }
}, []);
```

---

## 📈 Success Metrics

You'll know concurrency is working when you see:

✅ Cache stats box is visible and updating  
✅ Hit rate increases over time (50-90%)  
✅ Actor logs appear in console when volunteering  
✅ Page loads faster on subsequent visits  
✅ No duplicate network requests  
✅ Race detection warnings if you trigger them  

---

## 🎯 Quick Summary

**Fastest way to verify:**
1. Open `/volunteer` page
2. Look for purple cache stats box
3. Refresh page 2-3 times
4. Watch hit rate increase from 0% → 70%+

**That's it! If you see the stats updating, concurrency is working! 🎉**
