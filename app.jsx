// app.jsx - module (ESM)
const cfg = window.__APP_CONFIG__ || {};
const ACCESS_DURATION_MS = cfg.ACCESS_DURATION_MS || (10 * 60 * 1000);
const ACCESS_PASSWORD_SEED = String(cfg.ACCESS_PASSWORD_SEED || '').trim();

// helper: sha256 hex
async function sha256Hex(message) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(message));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function DemoApp() {
  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'light');
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [accessGranted, setAccessGranted] = React.useState(false);
  const [gatePassword, setGatePassword] = React.useState('');
  const [gateError, setGateError] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(ACCESS_DURATION_MS);

  const [page, setPage] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [cart, setCart] = React.useState([]);
  const [popup, setPopup] = React.useState(null);

  const products = [
    { id:1, name:'Laptop Pro 14' },
    { id:2, name:'Wireless Mouse' },
    { id:3, name:'Mechanical Keyboard' }
  ];

  // Precompute stored hash from seed at mount (client-side)
  const [storedHash, setStoredHash] = React.useState(null);
  React.useEffect(() => {
    (async () => {
      if (ACCESS_PASSWORD_SEED) {
        try {
          const h = await sha256Hex(ACCESS_PASSWORD_SEED);
          setStoredHash(h);
        } catch(e) {
          console.error('hash error', e);
        }
      }
    })();
  }, []);

  // handle gate: compare hash of input to precomputed storedHash
  const handlePasswordGate = async () => {
    if (!storedHash) {
      setGateError('Not ready, try again');
      return;
    }
    const h = await sha256Hex(gatePassword || '');
    if (h === storedHash) {
      setAccessGranted(true);
      setGateError('');
      setTimeLeft(ACCESS_DURATION_MS);
    } else {
      setGateError('Password salah');
    }
  };

  // timer
  React.useEffect(() => {
    if (!accessGranted) return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) {
          clearInterval(id);
          setAccessGranted(false);
          setGatePassword('');
          setPage('login');
          return ACCESS_DURATION_MS;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [accessGranted]);

  const formatTime = ms => {
    const minutes = Math.floor(ms/1000/60);
    const seconds = Math.floor((ms/1000)%60);
    return `${minutes}:${String(seconds).padStart(2,'0')}`;
  };

  const handleLogin = () => {
    if (email === 'user@example.com' && password === 'password123') {
      setError('');
      setPage('shop');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setEmail('');
    setPassword('');
    setCart([]);
    setError('');
    setPage('login');
  };

  const addToCart = (p) => {
    setCart(prev => [...prev, p]);
    setPopup(`${p.name} berhasil ditambahkan!`);
    setTimeout(()=> setPopup(null), 2000);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c.id !== id));
  };

  // Password gate UI (centered)
  if (!accessGranted) {
    return (
      React.createElement('div', {className:'container'},
        React.createElement('div', {className:'card'},
          React.createElement('img', {src:'logo.png', alt:'Company Logo', className:'company-logo'}),
          React.createElement('div', {style:{display:'flex', justifyContent:'center'}, className:'controls'},
            React.createElement('div', {className:'switch'},
              React.createElement('label', null, 'Theme'),
              React.createElement('select', {
                value: theme,
                onChange: e => setTheme(e.target.value)
              },
                React.createElement('option', {value:'light'}, 'Light'),
                React.createElement('option', {value:'dark'}, 'Dark')
              )
            )
          ),
          React.createElement('h2', null, 'Protected Access'),
          React.createElement('input', {
            type:'password',
            placeholder:'Enter Access Password',
            value: gatePassword,
            onChange: e => setGatePassword(e.target.value)
          }),
          gateError ? React.createElement('div', {className:'error'}, gateError) : null,
          React.createElement('div', {style:{display:'flex',gap:10,justifyContent:'center',marginTop:8}},
            React.createElement('button', {onClick: handlePasswordGate}, 'Enter'),
            React.createElement('button', {className:'ghost', onClick: ()=>{ setGatePassword(''); setGateError(''); }}, 'Clear')
          ),
          React.createElement('div', {className:'footer'}, 'You will be asked to enter a per-session password to access this demo.')
        )
      )
    );
  }

  // Main App UI
  return (
    React.createElement('div', {className:'container'},
      popup ? React.createElement('div', {className:'popup', 'data-testid':'popup-success'}, popup) : null,
      React.createElement('div', {className:'card'},
        React.createElement('img', {src:'logo.png', alt:'Company Logo', className:'company-logo'}),
        React.createElement('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}},
          React.createElement('div', {className:'timer-box'}, 'Session: ', React.createElement('strong', null, formatTime(timeLeft))),
          React.createElement('div', null,
            React.createElement('button', {className:'ghost', onClick: ()=>setTheme(theme==='dark'?'light':'dark')}, 'Toggle Theme'),
            React.createElement('button', {className:'logout', style:{marginLeft:8}, onClick: handleLogout}, 'Logout')
          )
        ),
        page==='login' ? React.createElement('div', null,
          React.createElement('h1', null, 'Demo Login'),
          React.createElement('input', {placeholder:'Email', value:email, onChange: e=>setEmail(e.target.value), 'data-testid':'email-input'}),
          React.createElement('input', {placeholder:'Password', type:'password', value:password, onChange: e=>setPassword(e.target.value), 'data-testid':'password-input'}),
          error ? React.createElement('div', {className:'error', 'data-testid':'login-error'}, error) : null,
          React.createElement('button', {onClick: handleLogin, 'data-testid':'login-button'}, 'Login')
        ) : null,
        page==='shop' ? React.createElement('div', null,
          React.createElement('h1', null, 'Demo Shop'),
          React.createElement('h2', null, 'Products'),
          products.map(p=> React.createElement('div', {key:p.id, className:'row'},
            React.createElement('span', null, p.name),
            React.createElement('div', null, React.createElement('button', {'data-testid':`add-${p.id}`, onClick: ()=>addToCart(p)}, 'Add'))
          )),
          React.createElement('h2', null, 'Cart'),
          React.createElement('div', {'data-testid':'cart-list'},
            cart.length===0 ? React.createElement('p', null, 'No items in cart') : null,
            cart.map(c=> React.createElement('div', {key:c.id, className:'row'},
              React.createElement('span', null, c.name),
              React.createElement('button', {'data-testid':`remove-${c.id}`, onClick: ()=>removeFromCart(c.id)}, 'Remove')
            ))
          )
        ) : null
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(DemoApp));
