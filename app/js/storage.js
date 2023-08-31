const cartId = 'shoppingCart';

const localAdapter = {
  saveCart: (object) => {
    const stringified = JSON.stringify(object);
    localStorage.setItem(cartId, stringified);
    return true;
  },
  getCart: () => {
    return JSON.parse(localStorage.getItem(cartId));
  },
  clearCart: () => {
    localStorage.removeItem(cartId);
  },
  saveProductData: (object) => {
    const stringified = JSON.stringify(object);
    localStorage.setItem('productData', stringified);
    return true;
  },
  getProducts: () => {
    return JSON.parse(localStorage.getItem('productData'));
  },
  saveLastFetched: (date) => {
    localStorage.setItem('lastFetched', date);
    return true;
  },
  getLastFetched: () => {
    return localStorage.getItem('lastFetched');
  },
};

const storage = localAdapter;

const getProducts = async () => {
  const url = 'http://localhost:3000/api';
  await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      localAdapter.saveProductData(data);
    });
};

const pollProductsAPI = async ({ interval }) => {
  console.log('Start polling');

  const executePoll = async () => {
    console.log('- polling producs');

    const lastFetched = storage.getLastFetched();
    let fetchedDate = new Date(lastFetched);
    if (!lastFetched || isDateBeforeToday(fetchedDate)) {
      console.log('Data expired  -  calling API');
      const result = await getProducts().then((res) => {
        console.log(res);
      });
      return;
    }
    setTimeout(executePoll, interval);
  };
  return new Promise(executePoll);
};

function isDateBeforeToday(date) {
  let fetchedDateString = date.toDateString();
  let todayString = new Date(new Date().toDastrString());
  return new Date(date.todateString()) < new Date(new Date().toDateString());
}
const helpers = {
  getHtml: function (id) {
    return document.getElementById(id).innerHTML;
  },
  setHtml: function (id, html) {
    document.getElementById(id).innerHTML = html;
    return true;
  },
  itemData: (object) => {
    const count = object.querySelector('.count'),
      patt = new RegExp('^[1-9]([0-9]+)?$');
    count.value = patt.test(count.value) === true ? parseInt(count.value) : 1;

    const item = {
      name: object.getAttribute('data-name'),
      price: object.getAttribute('data-price'),
      id: object.getAttribute('data-id'),
      count: count.value,
      total: parseInt(object.getAttribute('data-price')) * parseInt(count.value),
    };
    return item;
  },
  updateView: function () {
    const items = cart.getItems(),
      template = this.getHtml('cartTemplate'),
      compiled = _.template(template, {
        items: items,
      });
    this.setHtml('cartItems', compiled);
    this.updateTotal();
  },
  emptyView: function () {
    this.setHtml('cartItems', '<p>Add some items to see</p>');
    this.updateTotal();
  },
  updateTotal: function () {
    this.setHtml('totalPrice', '£' + cart.total.toFixed(2));
  },
  updateProducts: function () {
    const products = localAdapter.getProducts(),
      template = this.getHtml('productTemplate'),
      compiled = _.template(template, {
        items: products.ProductsList,
      });
    this.setHtml('main', compiled);
  },
};

const cart = {
  count: 0,
  total: 0,
  items: [],
  getItems: function () {
    return this.items;
  },
  setItems: function (items) {
    this.items = items;
    for (let i = 0; i < this.items.length; i++) {
      const _item = this.items[i];
      this.total += _item.total;
    }
  },
  clearItems: function () {
    this.items = [];
    this.total = 0;
    storage.clearCart();
    helpers.emptyView();
  },
  addItem: function (item) {
    if (this.containsItem(item.id) === false) {
      this.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        count: item.count,
        total: item.price * item.count,
      });

      storage.saveCart(this.items);
    } else {
      this.updateItem(item);
    }
    this.total += item.price * item.count;
    this.count += item.count;
    helpers.updateView();
  },
  containsItem: function (id) {
    if (this.items === undefined) {
      return false;
    }

    for (let i = 0; i < this.items.length; i++) {
      const _item = this.items[i];

      if (id == _item.id) {
        return true;
      }
    }
    return false;
  },
  updateItem: function (object) {
    for (let i = 0; i < this.items.length; i++) {
      const _item = this.items[i];

      if (object.id === _item.id) {
        _item.count = parseInt(object.count) + parseInt(_item.count);
        _item.total = parseInt(object.total) + parseInt(_item.total);
        this.items[i] = _item;
        storage.saveCart(this.items);
      }
    }
  },
};

document.addEventListener('DOMContentLoaded', function () {
  pollProductsAPI({ inverval: 10000 })
    .then(helpers.updateProducts())
    .then(() => {
      let products = document.querySelectorAll('.product button');
      [].forEach.call(products, (product) => {
        product.addEventListener('click', function (e) {
          const item = helpers.itemData(this.parentNode);
          cart.addItem(item);
        });
      });
    });

  if (storage.getCart()) {
    cart.setItems(storage.getCart());
    helpers.updateView();
  } else {
    helpers.emptyView();
  }

  document.querySelector('#clear').addEventListener('click', function (e) {
    cart.clearItems();
  });
});
