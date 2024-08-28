const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const fileProducts = "data/Products.json";
const fileArchive="data/Archive.json";
const Welcome = (req, res) => {
    res.send('Welcome to my ShitShop CRUD!');
}

const fsReadFile = (filePath) => {
    return new Promise((res, rej) => {
        fs.readFile(filePath, 'utf8', (error, data) => {
            if (!error) {
                if (data) {
                    res(JSON.parse(data));
                } else {
                    res([]);
                }
            } else if (error.code === 'ENOENT') {
                res([]); 
            } else {
                rej(error);
            }
        });
    });
};


const fsWriteFile = (filePath, data) => {
    return new Promise((res, rej) => {
        fs.writeFile(filePath, JSON.stringify(data), 'utf8', (err) => {
            if (err) {
                rej(err);
            } else {
                res('Success');
            }
        });
    });
}

const checkTheItem = (updatedProduct) => {
    return updatedProduct.title && updatedProduct.description && updatedProduct.category &&
        updatedProduct.price !== undefined && updatedProduct.discountPercentage !== undefined &&
        updatedProduct.rating !== undefined && updatedProduct.stock !== undefined && updatedProduct.tags &&
        updatedProduct.brand && updatedProduct.sku && updatedProduct.weight !== undefined &&
        updatedProduct.dimensions && updatedProduct.dimensions.width !== undefined &&
        updatedProduct.dimensions.height !== undefined && updatedProduct.dimensions.depth !== undefined &&
        updatedProduct.warrantyInformation && updatedProduct.shippingInformation &&
        updatedProduct.availabilityStatus && updatedProduct.reviews && updatedProduct.returnPolicy &&
        updatedProduct.minimumOrderQuantity !== undefined && updatedProduct.meta &&
        updatedProduct.meta.createdAt && updatedProduct.meta.updatedAt &&
        updatedProduct.meta.barcode && updatedProduct.meta.qrCode && updatedProduct.images && updatedProduct.thumbnail;
}
const CheckUpDate=(updatedProduct)=>{
    return updatedProduct.id|| updatedProduct.title || 
    updatedProduct.description || 
    updatedProduct.category || 
    updatedProduct.price !== undefined || 
    updatedProduct.discountPercentage !== undefined || 
    updatedProduct.rating !== undefined || 
    updatedProduct.stock !== undefined || 
    updatedProduct.tags || 
    updatedProduct.brand || 
    updatedProduct.sku || 
    updatedProduct.weight !== undefined || 
    updatedProduct.dimensions || 
    updatedProduct.warrantyInformation || 
    updatedProduct.shippingInformation || 
    updatedProduct.availabilityStatus || 
    updatedProduct.reviews || 
    updatedProduct.returnPolicy || 
    updatedProduct.minimumOrderQuantity !== undefined || 
    updatedProduct.meta || 
    updatedProduct.images || 
    updatedProduct.thumbnail;
}
const UpdateItem = async (req, res) => {
    const { id } = req.params;
    const updatedProduct = req.body;

    try {
        const products = await fsReadFile(fileProducts);
        let productFound = false;

        const updatedProducts = products.map(item => {
            if (item.id === id) {
                productFound = true;

                const hasUpdates = CheckUpDate(updatedProduct);
                if (!hasUpdates) {
                    return item; 
                }

                if (!checkTheItem(updatedProduct)) {
                    console.log('All fields are required');
                }
                return { ...item, ...updatedProduct };
            }
            return item; 
        });

        if (!productFound) {
            return res.status(404).json({ error: 'Product not found' });
        }
        await fsWriteFile(fileProducts, updatedProducts);
        res.json(updatedProducts.find(item => item.id === id));
    } catch (error) {
        if (error.message === 'All fields are required') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(400).json({ error: 'Error updating product' });
        }
    }
};
const AddItem = async (req, res) => {
    const newProduct = req.body;

    const id = uuidv4();
    const productID = { id, ...newProduct };

    if (!checkTheItem(productID)) {
        return res.status(400).json({ message: 'All fields are required' });
    }
        const products = await fsReadFile(fileProducts);
        products.push(productID);
        await fsWriteFile(fileProducts, products);
        res.json(productID);
}

const CheckItemByID = async (req, res) => {
    const { id } = req.params;

    try {
        const products = await fsReadFile(fileProducts);
        let foundProduct = null;

    
        products.map(item => {
            if (item.id == id) {
                foundProduct = item; 
            }
        });

        if (foundProduct) {
            res.json(foundProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error reading the file' });
    }
};
const checkItems = async (req, res) => {
    try {
        const products = await fsReadFile(fileProducts);
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(404).json({ error: 'Error reading the file' });
    }
}
const DeleteItem = async (req, res) => {
    const { id } = req.params;

    try {
        
        let products = await fsReadFile(fileProducts);
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'Products.json is missing or empty' });
        }

    
        const filteredProducts = products.filter(item => item.id !== id);

   
        if (filteredProducts.length === products.length) {
            return res.status(404).json({ error: 'Product not found' });
        }

  
        const removedProduct = products.find(item => item.id === id);

 
        let archivedProducts = await fsReadFile(fileArchive);
        if (!archivedProducts) {
            archivedProducts = [];
        }
        archivedProducts.push(removedProduct);

        await fsWriteFile(fileProducts, filteredProducts);
        await fsWriteFile(fileArchive, archivedProducts);

        res.json({ message: `Product with ID ${id} deleted and archived` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing the request' });
    }
};

module.exports = { Welcome, UpdateItem, AddItem, CheckItemByID ,checkItems,DeleteItem,fsWriteFile,fsReadFile};
