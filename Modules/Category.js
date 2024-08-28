const fs = require('fs');
const path = require('path');
const { fsReadFile, fsWriteFile } = require('./products');

const fileCategory = 'data/Category.json';
const fileArchiveCat =  'data/ArchiveCategory.json';

const checkTheItem = (product) => {
  return product.slug && product.name && product.url;
};

const UpdateCategory = async (req, res) => {
  const { name } = req.params;
  const updatedCategory = req.body;

  if (!checkTheItem(updatedCategory)) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const categories = await fsReadFile(fileCategory);
    let categoryFound = false;


    const updatedCategories = categories.map(item => {
      if (item.name === name) {
        categoryFound = true;
        return { ...item, ...updatedCategory }; 
      }
      return item; 
    });

    if (!categoryFound) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await fsWriteFile(fileCategory, updatedCategories);
    res.json(updatedCategories.find(item => item.name === name)); 
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({ error: 'Error updating category' });
  }
};

const AddCategory = async (req, res) => {
  const newProduct = req.body;

  if (!checkTheItem(newProduct)) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const products = await fsReadFile(fileCategory);
    products.push(newProduct);
    await fsWriteFile(fileCategory, products);
    res.json(newProduct);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(400).json({ error: 'Error adding category' });
  }
};

const checkCategory = async (req, res) => {
  try {
    const products = await fsReadFile(fileCategory);
    res.json(products);
  } catch (error) {
    console.error('Error reading the file:', error);
    res.status(404).json({ error: 'Error reading the file' });
  }
};

const DeleteCategory = async (req, res) => {
  const { name } = req.params;

  try {
    let categories = await fsReadFile(fileCategory);

    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category.json is missing or empty' });
    }

    const filteredCategories = categories.filter(item => item.name !== name);

    if (filteredCategories.length === categories.length) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const removedCategory = categories.find(item => item.name === name);

    let archivedCategories;
    try {
      archivedCategories = await fsReadFile(fileArchiveCat);
    } catch (error) {
      archivedCategories = [];
    }

    archivedCategories.push(removedCategory);

    await fsWriteFile(fileCategory, filteredCategories);
    await fsWriteFile(fileArchiveCat, archivedCategories);

    res.json({ message: `Category with name ${name} deleted and archived` });
  } catch (error) {
    console.error('Error during delete and archive operation:', error);
    res.status(500).json({ error: 'Error deleting and archiving category' });
  }
};

module.exports = { UpdateCategory, AddCategory, checkCategory, DeleteCategory };
