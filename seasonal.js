import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Use the same Project URL and Publishable key as admin.js
const SUPABASE_URL = 'https://ojhgbvagjyzmrhuqhsat.supabase.co';
const SUPABASE_KEY = 'sb_publishable__HZbRrV5DWcmQNusjSuQ9A_Cdzl32gX';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function displaySeasonalCollections() {
    const section = document.getElementById('seasonal');
    const title = document.getElementById('seasonal-title');
    const description = document.getElementById('seasonal-description');
    const productContainer = document.getElementById('seasonal-products');

    if (!section || !title || !description || !productContainer) return;

    section.hidden = true;
    productContainer.replaceChildren();

    // Find the active collection
    const { data: collection, error: collectionError } = await supabase
        .from('seasonal_collections')
        .select('id, title, description')
        .eq('is_active', true);

    if (collectionError) {
        console.error('Seasonal collection error:', collectionError.message);
        return;
    }

    if (!collection) return;

    // Load products belonging to that collection
    const { data: products, error: productsError } = await supabase
        .from('seasonal_products')
        .select('name, description, price, image_url, whatsapp_number')
        .eq('collection_id', collection.id)
        .order('created_at', { ascending: false });

    if (productsError) {
        console.error('Seasonal products error:', productsError.message);
        return;
    }

    title.textContent = collection.title;
    description.textContent = collection.description || '';

    products.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';

        const placeholder = document.createElement('div');
        placeholder.className = 'product-placeholder';

        if (product.image_url) {
            const image = document.createElement('img');
            image.src = product.image_url;
            image.alt = product.name || 'Seasonal product';
            image.loading = 'lazy';

            image.addEventListener('error', () => {
                placeholder.textContent = 'Seasonal';
                image.remove();
            }, { once: true });

            placeholder.appendChild(image);
        } else {
            placeholder.textContent = 'Seasonal';
        }

        const productName = document.createElement('h3');
        productName.textContent = product.name || 'Seasonal Product';

        const productDescription = document.createElement('p');
        productDescription.textContent = product.description || '';

        card.append(placeholder, productName, productDescription);

        // Display price only when one has been entered
        if (product.price !== null && product.price !== undefined) {
            const price = document.createElement('p');
            price.className = 'product-price';
            price.textContent = '₹' + Number(product.price).toLocaleString('en-IN');
            card.appendChild(price);
        }

        // WhatsApp order button
        const phone = (product.whatsapp_number || '').replace(/\D/g, '');

        if (phone) {
            const orderLink = document.createElement('a');
            orderLink.className = 'button';
            orderLink.href =
                'https://wa.me/' + phone +
                '?text=' + encodeURIComponent(
                    'Hi! I am interested in ' + product.name + '.'
                );
            orderLink.target = '_blank';
            orderLink.rel = 'noopener noreferrer';
            orderLink.textContent = 'Order on WhatsApp';

            card.appendChild(orderLink);
        }

        productContainer.appendChild(card);

        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            card.classList.add('reveal');
            requestAnimationFrame(() => card.classList.add('visible'));
        }
    });

    section.hidden = false;
}

displaySeasonalCollections();

