if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}

function ready() {
  var removeCartItemButtons = document.getElementsByClassName("btn-danger");
  for (var i = 0; i < removeCartItemButtons.length; i++) {
    var button = removeCartItemButtons[i];
    button.addEventListener("click", removeCartItem);
  }

  var quantityInputs = document.getElementsByClassName("cart-quantity-input");
  for (var i = 0; i < quantityInputs.length; i++) {
    var input = quantityInputs[i];
    input.addEventListener("change", quantityChanged);
  }

  var addToCartButtons = document.getElementsByClassName("shop-item-button");
  for (var i = 0; i < addToCartButtons.length; i++) {
    var button = addToCartButtons[i];
    button.addEventListener("click", addToCartClicked);
  }

  document
    .getElementsByClassName("btn-purchase")[0]
    .addEventListener("click", purchaseClicked);
}

// var stripeHandler = StripeCheckout.configure({
//     key: stripePublicKey,
//     locale: 'en',
//     token: function(token) {
//         var items = []
//         var cartItemContainer = document.getElementsByClassName('cart-items')[0]
//         var cartRows = cartItemContainer.getElementsByClassName('cart-row')
//         for (var i = 0; i < cartRows.length; i++) {
//             var cartRow = cartRows[i]
//             var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
//             var quantity = quantityElement.value
//             var id = cartRow.dataset.itemId
//             items.push({
//                 id: id,
//                 quantity: quantity
//             })
//         }

//         fetch('/purchase', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json'
//             },
//             body: JSON.stringify({
//                 stripeTokenId: token.id,
//                 items: items
//             })
//         }).then(function(res) {
//             return res.json()
//         }).then(function(data) {
//             alert(data.message)
//             var cartItems = document.getElementsByClassName('cart-items')[0]
//             while (cartItems.hasChildNodes()) {
//                 cartItems.removeChild(cartItems.firstChild)
//             }
//             updateCartTotal()
//         }).catch(function(error) {
//             console.error(error)
//         })
//     }
// })

function purchaseClicked() {
  var priceElement = document.getElementsByClassName("cart-total-price")[0];
  var price = Math.round(priceElement.innerText.replace("$", "") * 100);

  console.log(price);
  paysafe.checkout.setup(
    "cHVibGljLTc3NTE6Qi1xYTItMC01ZjAzMWNiZS0wLTMwMmQwMjE1MDA4OTBlZjI2MjI5NjU2M2FjY2QxY2I0YWFiNzkwMzIzZDJmZDU3MGQzMDIxNDUxMGJjZGFjZGFhNGYwM2Y1OTQ3N2VlZjEzZjJhZjVhZDEzZTMwNDQ=",
    {
      currency: "USD",
      amount: price,
      locale: "en_US",
      customer: {
        firstName: "John",
        lastName: "Dee",
        email: "johndee@paysafe.com",
        phone: "1234567890",
        dateOfBirth: {
          day: 1,
          month: 7,
          year: 1990,
        },
      },
      billingAddress: {
        nickName: "John Dee",
        street: "20735 Stevens Creek Blvd",
        street2: "Montessori",
        city: "Cupertino",
        zip: "95014",
        country: "US",
        state: "CA",
      },
      environment: "TEST",
      merchantRefNum: "1559900597607",
      merchantDescriptor: {
        dynamicDescriptor: "XYZ",
        phone: "1234567890",
      },
      displayPaymentMethods: ["card"],
      paymentMethodDetails: {
        paysafecard: {
          consumerId: "1232323",
        },
      },
    },
    function (instance, error, result) {
      if (result && result.paymentHandleToken) {
        console.log(result);
        // make AJAX call to Payments API
      } else {
        console.error(error);
        // Handle the error
      }
    },
    function (stage, expired) {
      switch (stage) {
        case "PAYMENT_HANDLE_NOT_CREATED": // Handle the scenario
        case "PAYMENT_HANDLE_CREATED": // Handle the scenario
        case "PAYMENT_HANDLE_REDIRECT": // Handle the scenario
        case "PAYMENT_HANDLE_PAYABLE": // Handle the scenario
        default: // Handle the scenario
      }
    }
  );

  // alert("Items Purchased successfully");
  var cartItems = document.getElementsByClassName("cart-items")[0];
  while (cartItems.hasChildNodes()) {
    cartItems.removeChild(cartItems.firstChild);
  }
  updateCartTotal();
}

function removeCartItem(event) {
  var buttonClicked = event.target;
  buttonClicked.parentElement.parentElement.remove();
  updateCartTotal();
}

function quantityChanged(event) {
  var input = event.target;
  if (isNaN(input.value) || input.value <= 0) {
    input.value = 1;
  }
  updateCartTotal();
}

function addToCartClicked(event) {
  var button = event.target;
  var shopItem = button.parentElement.parentElement;
  var title = shopItem.getElementsByClassName("shop-item-title")[0].innerText;
  var price = shopItem.getElementsByClassName("shop-item-price")[0].innerText;
  var imageSrc = shopItem.getElementsByClassName("shop-item-image")[0].src;
  var id = shopItem.dataset.itemId;
  addItemToCart(title, price, imageSrc, id);
  updateCartTotal();
}

function addItemToCart(title, price, imageSrc, id) {
  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  cartRow.dataset.itemId = id;
  var cartItems = document.getElementsByClassName("cart-items")[0];
  var cartItemNames = cartItems.getElementsByClassName("cart-item-title");
  for (var i = 0; i < cartItemNames.length; i++) {
    if (cartItemNames[i].innerText == title) {
      alert("This item is already added to the cart");
      return;
    }
  }
  var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`;
  cartRow.innerHTML = cartRowContents;
  cartItems.append(cartRow);
  cartRow
    .getElementsByClassName("btn-danger")[0]
    .addEventListener("click", removeCartItem);
  cartRow
    .getElementsByClassName("cart-quantity-input")[0]
    .addEventListener("change", quantityChanged);
}

function updateCartTotal() {
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");
  var total = 0;
  for (var i = 0; i < cartRows.length; i++) {
    var cartRow = cartRows[i];
    var priceElement = cartRow.getElementsByClassName("cart-price")[0];
    var quantityElement = cartRow.getElementsByClassName(
      "cart-quantity-input"
    )[0];
    var price = parseFloat(priceElement.innerText.replace("$", ""));
    var quantity = quantityElement.value;
    total = total + price * quantity;
  }
  total = Math.round(total * 100) / 100;
  document.getElementsByClassName("cart-total-price")[0].innerText =
    "$" + total;
}
