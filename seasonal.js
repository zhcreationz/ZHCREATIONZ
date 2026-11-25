
import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ojhgbvagjyzmrhuqhsat.supabase.co';
const SUPABASE_KEY = 'sb_publishable__HZbRrV5DWcmQNusjSuQ9A_Cdzl32gX';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function displaySeasonalCollections() {

    const section = document.getElementById('seasonal');
    const productContainer = document.getElementById('seasonal-products');

    if (!section || !productContainer) {
        console.error('Seasonal HTML elements not found.');
        return;
    }

    section.hidden = true;
    productContainer.replaceChildren();

    const { data: collections, error } = await supabase
        .from('seasonal_collections')
        .select('id, title, description')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Collection error:', error.message);
        return;
    }

    if (!collections || collections.length === 0) return;

    for (const collection of collections) {

        // Separate section for each collection
        const collectionSection = document.createElement('div');
        collectionSection.className = 'seasonal-collection-block';

        const heading = document.createElement('h2');
        heading.textContent = collection.title;

        const description = document.createElement('p');
        description.className = 'seasonal-collection-description';
        description.textContent = collection.description || '';

        // Independent grid for this collection
        const productsGrid = document.createElement('div');
        productsGrid.className = 'seasonal-product-grid';

        const { data: products, error: productsError } = await supabase
            .from('seasonal_products')
            .select('name, description, price, image_url, whatsapp_number')
            .eq('collection_id', collection.id)
            .order('created_at', { ascending: false });

        if (productsError) {
            console.error('Product error:', productsError.message);
            continue;
        }

        if (!products || products.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Products coming soon!';
            productsGrid.appendChild(emptyMessage);
        }

        (products || []).forEach(product => {

            const card = document.createElement('article');
            card.className = 'product-card';

            // Image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'product-image';

            if (product.image_url) {
                const image = document.createElement('img');
                image.src = product.image_url;
                image.alt = product.name || 'Seasonal product';
                image.loading = 'lazy';
                imageContainer.appendChild(image);
            } else {
                imageContainer.textContent = 'Seasonal';
            }

            // Product information
            const name = document.createElement('h3');
            name.textContent = product.name || 'Seasonal Product';

            const productDescription = document.createElement('p');
            productDescription.textContent = product.description || '';

            card.append(imageContainer, name, productDescription);

            // Price
            if (product.price !== null && product.price !== undefined) {
                const price = document.createElement('p');
                price.className = 'product-price';
                price.textContent =
                    '₹' + Number(product.price).toLocaleString('en-IN');
                card.appendChild(price);
            }

            // WhatsApp order
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

            productsGrid.appendChild(card);
        });

        collectionSection.append(
            heading,
            description,
            productsGrid
        );

        productContainer.appendChild(collectionSection);
    }

    section.hidden = false;

    console.log('Seasonal collections displayed:', collections);
}

displaySeasonalCollections();

