function DemoApp() {
  const [page, setPage] = React.useState("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [cart, setCart] = React.useState([]);

  const products = [
    { id: 1, name: "Celana Osi" },
    { id: 2, name: "Celana Pretty" },
    { id: 3, name: "Tas Ika" },
    { id: 4, name: "Jaket Lutfi" },
    { id: 5, name: "Sepatu Maul" }
  ];

  const handleLogin = () => {
    if (email === "test.qa@trimegah.com" && password === "password123") {
      setError("");
      setPage("shop");
    } else {
      setError("Invalid email or password");
    }
  };

  const addToCart = (p) => {
    setCart([...cart, p]);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  return (
    <div className="container">
      {page === "login" && (
        <div className="card">
          <h1>Demo Login</h1>
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="email-input"/>
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="password-input"/>
          {error && <div className="error" data-testid="login-error">{error}</div>}
          <button onClick={handleLogin} data-testid="login-button">Login</button>
        </div>
      )}

      {page === "shop" && (
        <div className="card">
          <h1>Demo Shop</h1>

          <h2>Products</h2>
          {products.map((p) => (
            <div key={p.id} className="row">
              <span>{p.name}</span>
              <button data-testid={`add-${p.id}`} onClick={() => addToCart(p)}>Add</button>
            </div>
          ))}

          <h2>Cart</h2>
          <div data-testid="cart-list">
            {cart.length === 0 && <p>No items in cart</p>}
            {cart.map((c) => (
              <div key={c.id} className="row">
                <span>{c.name}</span>
                <button data-testid={`remove-${c.id}`} onClick={() => removeFromCart(c.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<DemoApp />);
