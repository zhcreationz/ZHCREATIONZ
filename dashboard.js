import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ojhgbvagjyzmrhuqhsat.supabase.co';
const SUPABASE_KEY = 'sb_publishable__HZbRrV5DWcmQNusjSuQ9A_Cdzl32gX';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const message = document.getElementById('admin-message');
const collectionsList = document.getElementById('collections-list');

let selectedCollectionId = null;

function showMessage(text) {
    message.textContent = text;
}

// CHECK ADMIN LOGIN
async function checkAdmin() {
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
        window.location.href = 'admin.html';
        return false;
    }

    const { data: admin, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', session.user.id)
        .maybeSingle();

    if (error || !admin) {
        await supabase.auth.signOut();
        window.location.href = 'admin.html';
        return false;
    }

    return true;
}

// ADD COLLECTION
document.getElementById('collection-form')
.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = document.getElementById('collection-title')
        .value.trim();

    const description = document.getElementById('collection-description')
        .value.trim();

    const { error } = await supabase
        .from('seasonal_collections')
        .insert({
            title,
            description,
            is_active: false
        });

    if (error) {
        showMessage(error.message);
        return;
    }

    event.target.reset();
    showMessage('Collection added successfully!');
    loadCollections();
});

// LOAD COLLECTIONS
async function loadCollections() {
    const { data, error } = await supabase
        .from('seasonal_collections')
        .select('*')
        .order('created_at', { ascending: false });

    collectionsList.replaceChildren();

    if (error) {
        showMessage(error.message);
        return;
    }

    if (!data.length) {
        collectionsList.textContent = 'No collections added yet.';
        return;
    }

    data.forEach(collection => {
        const card = document.createElement('div');
        card.className = 'seasonal-admin-card';

        const heading = document.createElement('h3');
        heading.textContent = collection.title;

        const description = document.createElement('p');
        description.textContent = collection.description || '';

        const status = document.createElement('p');
        status.textContent = collection.is_active ? 'ACTIVE' : 'INACTIVE';

        const activate = document.createElement('button');
        activate.type = 'button';
        activate.textContent = collection.is_active
            ? 'Deactivate'
            : 'Activate';

        activate.addEventListener('click', () =>
            toggleCollection(collection)
        );

        const edit = document.createElement('button');
        edit.type = 'button';
        edit.textContent = 'Edit Collection';

        edit.addEventListener('click', () =>
            editCollection(collection)
        );

        const manage = document.createElement('button');
        manage.type = 'button';
        manage.textContent = 'Manage Products';

        manage.addEventListener('click', () =>
            selectCollection(collection)
        );

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Delete Collection';

        remove.addEventListener('click', () =>
            deleteCollection(collection)
        );

        card.append(
            heading, description, status,
            activate, edit, manage, remove
        );

        collectionsList.appendChild(card);
    });
}

// ACTIVATE / DEACTIVATE COLLECTION
async function toggleCollection(collection) {
    if (collection.is_active) {
        const { error } = await supabase
            .from('seasonal_collections')
            .update({ is_active: is_active })
            .eq('id', collection.id);

        if (error) {
            showMessage(error.message);
            return;
        }
    } else {
        const { error: deactivateError } = await supabase
            .from('seasonal_collections')
            .update({ is_active: false })
            .eq('is_active', true);

        if (deactivateError) {
            showMessage(deactivateError.message);
            return;
        }

        const { error } = await supabase
            .from('seasonal_collections')
            .update({ is_active: true })
            .eq('id', collection.id);

        if (error) {
            showMessage(error.message);
            return;
        }
    }

    showMessage('Collection status updated!');
    loadCollections();
}

// EDIT COLLECTION
async function editCollection(collection) {
    const title = prompt('Enter collection name:', collection.title);

    if (title === null) return;

    if (!title.trim()) {
        showMessage('Collection name cannot be empty.');
        return;
    }

    const description = prompt(
        'Enter collection description:',
        collection.description || ''
    );

    if (description === null) return;

    const { error } = await supabase
        .from('seasonal_collections')
        .update({
            title: title.trim(),
            description: description.trim()
        })
        .eq('id', collection.id);

    if (error) {
        showMessage(error.message);
        return;
    }

    showMessage('Collection updated!');
    loadCollections();
}

// SELECT COLLECTION
function selectCollection(collection) {
    selectedCollectionId = collection.id;

    document.getElementById('product-section').hidden = false;

    document.getElementById('selected-collection-title')
        .textContent = 'Products: ' + collection.title;

    loadProducts();
}

// ADD PRODUCT
document.getElementById('product-form')
.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!selectedCollectionId) {
        showMessage('Select a collection first.');
        return;
    }

    const name = document.getElementById('product-name')
        .value.trim();

    const description = document.getElementById('product-description')
        .value.trim();

    const priceInput = document.getElementById('product-price').value;

    const price = priceInput === '' ? null : Number(priceInput);

    const file = document.getElementById('product-image').files[0];

    const whatsapp = document.getElementById('product-whatsapp')
        .value.trim();

    if (!file || !file.type.startsWith('image/')) {
        showMessage('Please select a valid product image.');
        return;
    }

    if (price !== null && (!Number.isFinite(price) || price < 0)) {
        showMessage('Enter a valid price.');
        return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(whatsapp)) {
        showMessage('Enter a valid WhatsApp number with country code.');
        return;
    }

    const extension = file.name.split('.').pop().toLowerCase();

    const filePath = selectedCollectionId + '/' +
        Date.now() + '-' +
        Math.random().toString(36).slice(2) + '.' + extension;

    showMessage('Uploading image...');

    const { error: uploadError } = await supabase.storage
        .from('seasonal-images')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        });

    if (uploadError) {
        showMessage(uploadError.message);
        return;
    }

    const { data: imageData } = supabase.storage
        .from('seasonal-images')
        .getPublicUrl(filePath);

    const { error } = await supabase
        .from('seasonal_products')
        .insert({
            collection_id: selectedCollectionId,
            name,
            description,
            price,
            image_url: imageData.publicUrl,
            whatsapp_number: whatsapp
        });

    if (error) {
        await supabase.storage
            .from('seasonal-images')
            .remove([filePath]);

        showMessage(error.message);
        return;
    }

    event.target.reset();
    showMessage('Product added successfully!');
    loadProducts();
});

// LOAD PRODUCTS
async function loadProducts() {
    const list = document.getElementById('products-list');
    list.replaceChildren();

    const { data, error } = await supabase
        .from('seasonal_products')
        .select('*')
        .eq('collection_id', selectedCollectionId)
        .order('created_at', { ascending: false });

    if (error) {
        showMessage(error.message);
        return;
    }

    if (!data.length) {
        list.textContent = 'No products added yet.';
        return;
    }

    data.forEach(product => {
        const card = document.createElement('div');
        card.className = 'seasonal-admin-card';

        const image = document.createElement('img');
        image.src = product.image_url;
        image.alt = product.name;
        image.style.width = '120px';
        image.style.height = '120px';
        image.style.objectFit = 'cover';

        const heading = document.createElement('h4');
        heading.textContent = product.name;

        const description = document.createElement('p');
        description.textContent = product.description || '';

        const price = document.createElement('p');
        price.textContent = product.price === null
            ? 'No price entered'
            : '₹' + Number(product.price).toLocaleString('en-IN');

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = 'Delete Product';

        remove.addEventListener('click', () =>
            deleteProduct(product)
        );

        card.append(image, heading, description, price, remove);
        list.appendChild(card);
    });
}

// DELETE PRODUCT
async function deleteProduct(product) {
    if (!confirm('Delete this product?')) return;

    const { error } = await supabase
        .from('seasonal_products')
        .delete()
        .eq('id', product.id);

    if (error) {
        showMessage(error.message);
        return;
    }

    const marker = '/seasonal-images/';
    const imagePath = product.image_url.split(marker)[1];

    if (imagePath) {
        await supabase.storage
            .from('seasonal-images')
            .remove([decodeURIComponent(imagePath)]);
    }

    showMessage('Product deleted!');
    loadProducts();
}

// DELETE COLLECTION
async function deleteCollection(collection) {
    if (!confirm(
        'Delete this collection and all its products?'
    )) return;

    const { data: products, error: readError } = await supabase
        .from('seasonal_products')
        .select('image_url')
        .eq('collection_id', collection.id);

    if (readError) {
        showMessage(readError.message);
        return;
    }

    const marker = '/seasonal-images/';

    const imagePaths = products
        .map(product => {
            const path = product.image_url?.split(marker)[1];
            return path ? decodeURIComponent(path) : null;
        })
        .filter(Boolean);

    const { error } = await supabase
        .from('seasonal_collections')
        .delete()
        .eq('id', collection.id);

    if (error) {
        showMessage(error.message);
        return;
    }

    if (imagePaths.length) {
        await supabase.storage
            .from('seasonal-images')
            .remove(imagePaths);
    }

    if (selectedCollectionId === collection.id) {
        selectedCollectionId = null;
        document.getElementById('product-section').hidden = true;
    }

    showMessage('Collection deleted!');
    loadCollections();
}

// LOGOUT
document.getElementById('logout-button')
.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'admin.html';
});

// START DASHBOARD
if (await checkAdmin()) {
    await loadCollections();
}
