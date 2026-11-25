

import { createClient } from
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://ojhgbvagjyzmrhuqhsat.supabase.co';
const SUPABASE_KEY = 'sb_publishable__HZbRrV5DWcmQNusjSuQ9A_Cdzl32gX';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// DISPLAY SEASONAL COLLECTIONS
async function displaySeasonalCollections() {

    const section = document.getElementById('seasonal');
    const title = document.getElementById('seasonal-title');
    const description = document.getElementById('seasonal-description');
    const productContainer = document.getElementById('seasonal-products');

    if (!section || !title || !description || !productContainer) {
        console.error('Seasonal HTML elements not found.');
        return;
    }

    section.hidden = true;
    productContainer.replaceChildren();

    // GET ALL ACTIVE COLLECTIONS
    const { data: collections, error } = await supabase
        .from('seasonal_collections')
        .select('id, title, description')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Seasonal collection error:', error.message);
        return;
    }

    if (!collections || collections.length === 0) {
        console.log('No active seasonal collections.');
        return;
    }

    // DISPLAY EACH COLLECTION
    for (const collection of collections) {

        const collectionBlock = document.createElement('div');
        collectionBlock.className = 'seasonal-collection-block';

        const collectionTitle = document.createElement('h2');
        collectionTitle.textContent = collection.title;

        const collectionDescription = document.createElement('p');
        collectionDescription.textContent = collection.description || '';

        // REUSE ORIGINAL WEBSITE PRODUCT GRID
        const productsGrid = document.createElement('div');
        productsGrid.className = 'product-grid';


        // LOAD PRODUCTS FOR THIS COLLECTION
        const { data: products, error: productsError } = await supabase
            .from('seasonal_products')
            .select('name, description, price, image_url, whatsapp_number')
            .eq('collection_id', collection.id)
            .order('created_at', { ascending: false });

        if (productsError) {
            console.error('Product loading error:', productsError.message);
            continue;
        }

        if (!products || products.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'Products coming soon!';
            productsGrid.appendChild(emptyMessage);
        }

        // DISPLAY EACH PRODUCT
        (products || []).forEach(product => {

            const card = document.createElement('article');
            card.className = 'product-card';

            // PRODUCT IMAGE CONTAINER
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

            card.appendChild(imageContainer);


            // PRODUCT NAME
            const name = document.createElement('h3');
            name.textContent = product.name || 'Seasonal Product';


            // PRODUCT DESCRIPTION
            const productDescription = document.createElement('p');
            productDescription.textContent = product.description || '';

            card.append(name, productDescription);


            // PRODUCT PRICE
            if (product.price !== null && product.price !== undefined) {

                const price = document.createElement('p');
                price.className = 'product-price';

                price.textContent =
                    '₹' + Number(product.price).toLocaleString('en-IN');

                card.appendChild(price);
            }


            // WHATSAPP ORDER BUTTON
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


        // ADD COLLECTION TO PAGE
        collectionBlock.append(
            collectionTitle,
            collectionDescription,
            productsGrid
        );

        productContainer.appendChild(collectionBlock);
    }


    // SHOW SEASONAL SECTION
    section.hidden = false;

    console.log('Seasonal collections displayed:', collections);
}


// RUN FUNCTION
displaySeasonalCollections();

