import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

function Home() {
  const [user, setUser] = useState({
    email: '',
    role: '',
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loggedInEmail =
      localStorage.getItem('sellerEmail') ||
      localStorage.getItem('userEmail');

    const role = localStorage.getItem('role') || '';

    const token = localStorage.getItem('accessToken');

    if (loggedInEmail && token) {
      setUser({
        email: loggedInEmail,
        role: role.toLowerCase(),
      });
    }

    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      setLoading(true);

      const res = await API.get('/products');

      console.log('Fetched All Products Response:', res.data);

      let productData = [];

      if (Array.isArray(res.data)) {
        productData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        productData = res.data.data;
      } else if (res.data && Array.isArray(res.data.products)) {
        productData = res.data.products;
      }

      setProducts(productData);
    } catch (error) {
      console.error(
        'Error fetching products:',
        error.response?.data || error.message
      );

      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = () => {
    localStorage.removeItem('sellerEmail');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');

    setUser({
      email: '',
      role: '',
    });

    navigate('/login');
  };

  const isSeller = user.role === 'seller';

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px 30px',
          background: '#333',
          color: '#fff',
        }}
      >
        <h2>My E-Commerce Shop</h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <span>
            User: <strong>{user.email || 'Guest'}</strong>
          </span>

          {user.role && (
            <span>
              Role: <strong>{user.role}</strong>
            </span>
          )}

          <button
            onClick={handleAuthAction}
            style={{
              padding: '6px 14px',
              fontSize: '14px',
              backgroundColor: user.email ? '#d9534f' : '#5cb85c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {user.email ? 'Logout' : 'Login'}
          </button>
        </div>
      </nav>

      <div style={{ padding: '30px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2>All Available Products</h2>

          {isSeller && (
            <button
              onClick={() => navigate('/products')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0275d8',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              + Add New Product
            </button>
          )}
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {products.length > 0 ? (
              products.map((product) => {
                let imageUrl = '';

                const imgField = product.images || product.image;

                if (imgField) {
                  if (Array.isArray(imgField) && imgField.length > 0) {
                    imageUrl = imgField[0];
                  } else if (typeof imgField === 'string') {
                    imageUrl = imgField;
                  }
                }

                if (
                  imageUrl &&
                  !imageUrl.startsWith('http://') &&
                  !imageUrl.startsWith('https://')
                ) {
                  imageUrl = `http://localhost:4000${
                    imageUrl.startsWith('/') ? '' : '/'
                  }${imageUrl}`;
                }

                const productPrice =
                  typeof product.price === 'object'
                    ? product.price?.amount
                    : product.price;

                return (
                  <div
                    key={product._id || product.id}
                    style={{
                      border: '1px solid #ccc',
                      padding: '15px',
                      borderRadius: '5px',
                      width: '220px',
                      background: '#fff',
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.title || 'Product Image'}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '10px',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '140px',
                          background: '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          marginBottom: '10px',
                          color: '#777',
                          fontSize: '13px',
                        }}
                      >
                        No Image Available
                      </div>
                    )}

                    <h3
                      style={{
                        fontSize: '16px',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {product.title || 'Untitled Product'}
                    </h3>

                    <p
                      style={{
                        margin: '0 0 6px 0',
                        fontWeight: 'bold',
                      }}
                    >
                      Price: ${productPrice ?? 'N/A'}
                    </p>

                    <p
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        margin: '0 0 8px 0',
                      }}
                    >
                      {product.description
                        ? `${product.description.substring(0, 40)}...`
                        : 'No description'}
                    </p>

                    <p
                      style={{
                        fontSize: '11px',
                        color: '#888',
                        margin: 0,
                        fontStyle: 'italic',
                      }}
                    >
                      Seller:{' '}
                      {product.seller?.name ||
                        product.seller?.email ||
                        'Unknown'}
                    </p>
                  </div>
                );
              })
            ) : (
              <p>No products found in database.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;