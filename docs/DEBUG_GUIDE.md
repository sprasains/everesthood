# 🐛 Debug Guide

## Development Tools

### VS Code Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Next.js",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "port": 9229,
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["test"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Chrome DevTools
```typescript
// Source Maps
{
  "compilerOptions": {
    "sourceMap": true
  }
}

// Performance marks
performance.mark('startOperation');
await operation();
performance.mark('endOperation');
performance.measure(
  'operation',
  'startOperation',
  'endOperation'
);

// Console API
console.table(data);
console.trace('Error occurred');
console.profile('slowFunction');
slowFunction();
console.profileEnd('slowFunction');
```

### React DevTools
```typescript
// Component profiling
import { Profiler } from 'react';

<Profiler id="App" onRender={callback}>
  <App />
</Profiler>

// Debug values
const Component = () => {
  const value = useDebugValue('debug info');
  return <div />;
};

// Strict Mode
<StrictMode>
  <App />
</StrictMode>
```

## Debugging Techniques

### API Debugging
```typescript
// Request logging
const logRequest = (req: Request) => {
  console.log({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    query: req.query,
  });
};

// Response logging
const logResponse = (res: Response) => {
  console.log({
    status: res.statusCode,
    headers: res.getHeaders(),
    body: res._getData(),
  });
};

// API middleware
app.use((req, res, next) => {
  logRequest(req);
  
  const oldJson = res.json;
  res.json = function(body) {
    logResponse(res);
    return oldJson.call(this, body);
  };
  
  next();
});
```

### Database Debugging
```typescript
// Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Query performance
prisma.$use(async (params, next) => {
  const start = performance.now();
  const result = await next(params);
  const end = performance.now();
  
  console.log(`${params.model}.${params.action} took ${end - start}ms`);
  return result;
});

// Transaction debugging
await prisma.$transaction(async (tx) => {
  console.log('Transaction started');
  const result = await tx.user.create({
    data: userData,
  });
  console.log('Transaction completed');
  return result;
});
```

### React Component Debugging
```typescript
// Component props
const Component = (props) => {
  console.log('Props:', props);
  return <div />;
};

// Hook debugging
const useDebugHook = () => {
  const value = useState(null);
  useEffect(() => {
    console.log('Effect ran');
    return () => console.log('Effect cleanup');
  }, []);
  return value;
};

// Context debugging
const Context = React.createContext(null);
const ContextProvider = ({ children }) => {
  const [state, setState] = useState(null);
  console.log('Context state:', state);
  return (
    <Context.Provider value={[state, setState]}>
      {children}
    </Context.Provider>
  );
};
```

### State Management Debugging
```typescript
// Zustand middleware
const logMiddleware = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get());
      set(...args);
      console.log('Next state:', get());
    },
    get,
    api
  );

// Redux DevTools
const store = create(
  devtools(
    (set) => ({
      // store config
    })
  )
);
```

### Performance Debugging
```typescript
// Component render tracking
const withRenderTracking = (WrappedComponent) => {
  return function TrackedComponent(props) {
    console.log(`${WrappedComponent.name} rendered`);
    return <WrappedComponent {...props} />;
  };
};

// Memory leak detection
useEffect(() => {
  const handler = () => {
    // event handler
  };
  
  console.log('Event listener added');
  window.addEventListener('event', handler);
  
  return () => {
    console.log('Event listener removed');
    window.removeEventListener('event', handler);
  };
}, []);

// Performance monitoring
const monitor = {
  start: (label) => performance.mark(`${label}-start`),
  end: (label) => {
    performance.mark(`${label}-end`);
    performance.measure(
      label,
      `${label}-start`,
      `${label}-end`
    );
  },
};
```

### Network Debugging
```typescript
// Axios interceptors
axios.interceptors.request.use((config) => {
  console.log('Request:', config);
  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log('Response:', response);
    return response;
  },
  (error) => {
    console.error('Error:', error);
    return Promise.reject(error);
  }
);

// WebSocket debugging
const ws = new WebSocket(url);
ws.addEventListener('open', (event) => {
  console.log('WebSocket opened:', event);
});
ws.addEventListener('message', (event) => {
  console.log('WebSocket message:', event.data);
});
ws.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});
```

### Error Debugging
```typescript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection:', event.reason);
});

// Error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.error('Error boundary caught:', error);
    console.error('Component stack:', info.componentStack);
  }
}
```

## Common Issues

### React Issues
```typescript
// Key prop warnings
const List = ({ items }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
);

// State updates on unmounted components
const Component = () => {
  const [mounted, setMounted] = useState(true);
  useEffect(() => {
    let active = true;
    fetchData().then((data) => {
      if (active) setState(data);
    });
    return () => { active = false; };
  }, []);
};

// Infinite re-renders
const Component = ({ callback }) => {
  // Wrong: Creates new function each render
  const onClick = () => callback();
  
  // Right: Memoize callback
  const onClick = useCallback(() => callback(), [callback]);
};
```

### API Issues
```typescript
// CORS errors
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Authentication errors
const checkAuth = (req: Request) => {
  console.log('Headers:', req.headers);
  console.log('Session:', req.session);
  console.log('Cookies:', req.cookies);
};

// Rate limiting issues
const debugRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({ message: 'Too many requests' });
  },
});
```

## Best Practices

### DO
- Use source maps
- Enable error logging
- Monitor performance
- Check memory leaks
- Test error scenarios
- Document debug steps
- Use debugging tools

### DON'T
- Leave debug logs in production
- Ignore TypeScript errors
- Skip error handling
- Commit sensitive data
- Use console.log for production
- Ignore performance warnings

## Resources
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools)
- [React DevTools](https://reactjs.org/blog/2019/08/15/new-react-devtools.html)
- [VS Code Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Next.js Debugging](https://nextjs.org/docs/advanced-features/debugging)
