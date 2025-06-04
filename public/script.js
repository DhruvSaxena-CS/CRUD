document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const itemForm = document.getElementById('item-form');
  const itemsList = document.getElementById('items-list');
  const formTitle = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const itemIdInput = document.getElementById('item-id');
  const nameInput = document.getElementById('name');
  const descriptionInput = document.getElementById('description');
  
  // API base URL
  const API_URL = '/api/items';
  
  // State management
  let isEditing = false;
  
  // Event listeners
  itemForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', resetForm);
  
  // Fetch all items on page load
  fetchItems();
  
  // Function to fetch all items from the API
  async function fetchItems() {
    try {
      const response = await fetch(API_URL);
      const items = await response.json();
      renderItems(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      showErrorMessage('Failed to load items. Please try again later.');
    }
  }
  
  // Function to render items to the DOM
  function renderItems(items) {
    itemsList.innerHTML = '';
    
    if (items.length === 0) {
      itemsList.innerHTML = '<p>No items found. Add some items using the form above.</p>';
      return;
    }
    
    items.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'item-card';
      itemCard.innerHTML = `
        <div class="item-header">
          <h3 class="item-title">${item.name}</h3>
          <div class="item-actions">
            <button class="edit-btn" data-id="${item.id}">Edit</button>
            <button class="delete-btn" data-id="${item.id}">Delete</button>
          </div>
        </div>
        <p class="item-description">${item.description || 'No description provided.'}</p>
        <p class="item-date">Created: ${new Date(item.created_at).toLocaleString()}</p>
      `;
      
      // Add event listeners to buttons
      const editBtn = itemCard.querySelector('.edit-btn');
      const deleteBtn = itemCard.querySelector('.delete-btn');
      
      editBtn.addEventListener('click', () => editItem(item.id));
      deleteBtn.addEventListener('click', () => deleteItem(item.id));
      
      itemsList.appendChild(itemCard);
    });
  }
  
  // Function to handle form submissions (create or update)
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const itemData = {
      name: nameInput.value.trim(),
      description: descriptionInput.value.trim()
    };
    
    if (!itemData.name) {
      alert('Name is required');
      return;
    }
    
    try {
      if (isEditing) {
        // Update existing item
        await updateItem(itemIdInput.value, itemData);
      } else {
        // Create new item
        await createItem(itemData);
      }
      
      resetForm();
      fetchItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item. Please try again.');
    }
  }
  
  // Function to create a new item
  async function createItem(itemData) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create item');
    }
    
    return response.json();
  }
  
  // Function to fetch a single item for editing
  async function editItem(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const item = await response.json();
      
      // Populate the form with item data
      itemIdInput.value = item.id;
      nameInput.value = item.name;
      descriptionInput.value = item.description || '';
      
      // Update UI to show we're editing
      formTitle.textContent = 'Edit Item';
      submitBtn.textContent = 'Update';
      cancelBtn.style.display = 'block';
      isEditing = true;
      
      // Scroll to form
      document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching item for edit:', error);
      alert('Failed to load item for editing. Please try again.');
    }
  }
  
  // Function to update an existing item
  async function updateItem(id, itemData) {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update item');
    }
    
    return response.json();
  }
  
  // Function to delete an item
  async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item');
      }
      
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  }
  
  // Function to reset the form after submission or cancellation
  function resetForm() {
    itemForm.reset();
    itemIdInput.value = '';
    formTitle.textContent = 'Add New Item';
    submitBtn.textContent = 'Save';
    cancelBtn.style.display = 'none';
    isEditing = false;
  }
  
  // Function to show error messages
  function showErrorMessage(message) {
    itemsList.innerHTML = `<p class="error-message">${message}</p>`;
  }
});