import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const Products = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'INR',
    size: 'M',
    stock: 10,
  });
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Minimum Length Validation
    if (formData.title.trim().length < 2) {
      alert("Title must be at least 2 characters long");
      return;
    }
    if (formData.description.trim().length < 20) {
      alert("Description must be at least 20 characters long!");
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);

    // Seller email append kora jate backend bujhte pare kar product
    const sellerEmail = localStorage.getItem('sellerEmail');
    if (sellerEmail) {
      data.append('sellerEmail', sellerEmail);
    }

    // Price Format for Multer / Express Body Parser
    data.append('price[amount]', Number(formData.amount));
    data.append('price[currency]', formData.currency || 'INR');

    // Sizes Array
    const sizesArray = [{ size: formData.size, stock: Number(formData.stock) }];
    data.append('sizes', JSON.stringify(sizesArray));

    // Multiple Images Append
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      await API.post('/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Product created successfully!');
      navigate('/'); // Product create howar por Home page-e chole jabe

    } catch (err) {
      console.error('Error Response:', err.response?.data);

      if (err.response?.data?.errors) {
        const validationMsgs = err.response.data.errors
          .map((e) => `${e.path || e.param || 'Error'}: ${e.msg}`)
          .join('\n');
        alert(`Validation failed:\n\n${validationMsgs}`);
      } else {
        alert(err.response?.data?.message || 'Invalid Request Data');
      }
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Add New Product</h2>
        <button 
          onClick={() => navigate('/')} 
          className="text-sm bg-gray-300 px-3 py-1 rounded cursor-pointer"
        >
          Back to Home
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            placeholder="Product Title (min 2 chars)"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Product Description (minimum 20 characters)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded h-24"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price Amount</label>
            <input
              type="number"
              placeholder="Price"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Images</label>
          <input
            type="file"
            multiple
            onChange={(e) => setImages(e.target.files)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold cursor-pointer">
          Create Product
        </button>
      </form>
    </div>
  );
};

export default Products;