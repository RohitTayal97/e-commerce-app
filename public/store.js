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

var singleUseCustomerToken = null;
const createSingleUseCustomerToken = (customerId) => {
  var request = new XMLHttpRequest();
  request.open(
    "POST",
    "https://private-anon-8467725ed3-paysafeapipaymenthubv1.apiary-proxy.com/paymenthub/v1/customers/" +
      customerId +
      "/singleusecustomertokens",
    false
  );
  request.setRequestHeader("Content-type", "application/json");
  request.setRequestHeader(
    "Authorization",
    "Basic cHJpdmF0ZS03NzUxOkItcWEyLTAtNWYwMzFjZGQtMC0zMDJkMDIxNDQ5NmJlODQ3MzJhMDFmNjkwMjY4ZDNiOGViNzJlNWI4Y2NmOTRlMjIwMjE1MDA4NTkxMzExN2YyZTFhODUzMTUwNWVlOGNjZmM4ZTk4ZGYzY2YxNzQ4"
  );
  request.send(
    JSON.stringify({
      merchantRefNum: new Date().getTime(),
      paymentTypes: ["CARD"],
    })
  );

  singleUseCustomerToken = JSON.parse(request.response).singleUseCustomerToken;
};

const updateCustomerId = (customerId, merchantCustomerId) => {
  var url = "/user/addCustId";
  var request = new XMLHttpRequest();
  var data = {
    customerId: customerId,
    _id: merchantCustomerId,
  };
  request.open("POST", url, true);

  request.setRequestHeader("Content-type", "application/json");

  request.onerror = function (err) {
    console.error(err);
  };

  request.send(JSON.stringify(data));
};

var totalAmount = 0;
const CreatePaymentHandle = (userObj, userIds) => {
  if (userIds.customerId) {
    createSingleUseCustomerToken(userIds.customerId);
  }

  const year = parseInt(userObj.get("dateOfBirth").substr(0, 4));
  const month = parseInt(userObj.get("dateOfBirth").substr(5, 2));
  const day = parseInt(userObj.get("dateOfBirth").substr(8));

  paysafe.checkout.setup(
    "cHVibGljLTc3NTE6Qi1xYTItMC01ZjAzMWNiZS0wLTMwMmQwMjE1MDA4OTBlZjI2MjI5NjU2M2FjY2QxY2I0YWFiNzkwMzIzZDJmZDU3MGQzMDIxNDUxMGJjZGFjZGFhNGYwM2Y1OTQ3N2VlZjEzZjJhZjVhZDEzZTMwNDQ=",
    {
      currency: "USD",
      amount: totalAmount,
      ...(singleUseCustomerToken && {
        singleUseCustomerToken: singleUseCustomerToken,
      }),
      locale: "en_US",
      customer: {
        firstName: userObj.get("firstName"),
        lastName: userObj.get("lastName"),
        email: userObj.get("email"),
        phone: "1234567890",
        dateOfBirth: {
          day: day,
          month: month,
          year: year,
        },
      },
      billingAddress: {
        nickName: userObj.get("firstName") + " " + userObj.get("lastName"),
        street: userObj.get("street"),
        city: userObj.get("city"),
        zip: userObj.get("zip"),
        country: userObj.get("country"),
        state: userObj.get("state"),
      },
      environment: "TEST",
      merchantRefNum: "1559900597607",
      merchantDescriptor: {
        dynamicDescriptor: "Rohit Tayal",
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
        var request = new XMLHttpRequest();
        request.open(
          "POST",
          "https://private-anon-8467725ed3-paysafeapipaymenthubv1.apiary-proxy.com/paymenthub/v1/payments",
          true
        );
        request.setRequestHeader("Content-type", "application/json");
        request.setRequestHeader(
          "Authorization",
          "Basic cHJpdmF0ZS03NzUxOkItcWEyLTAtNWYwMzFjZGQtMC0zMDJkMDIxNDQ5NmJlODQ3MzJhMDFmNjkwMjY4ZDNiOGViNzJlNWI4Y2NmOTRlMjIwMjE1MDA4NTkxMzExN2YyZTFhODUzMTUwNWVlOGNjZmM4ZTk4ZGYzY2YxNzQ4"
        );
        request.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 201) {
            const resp = JSON.parse(request.response);

            if (resp.customerId && !userIds.customerId) {
              updateCustomerId(resp.customerId, userIds.merchantCustomerId);
            }

            if (instance.isOpen()) {
              instance.showSuccessScreen();
              setTimeout(function () {
                instance.close();
              }, 3000);
            } else {
              alert(`Payment of ${totalAmount / 100} is Successful!`);
            }
          }
        };
        const reqObj = {
          merchantRefNum: new Date().getTime(),
          amount: totalAmount,
          currencyCode: "USD",
          ...(result.customerOperation == "ADD" &&
            (userIds.customerId
              ? { customerId: userIds.customerId }
              : { merchantCustomerId: userIds.merchantCustomerId })),
          settleWithAuth: true,
          paymentHandleToken: result.paymentHandleToken,
          description: "Payment at Green Day Store",
        };
        request.send(JSON.stringify(reqObj));
      } else {
        console.error(error);
      }
    },
    function (stage, expired) {
      if (expired) {
        return;
      }
      switch (stage) {
        case "PAYMENT_HANDLE_NOT_CREATED":
          alert("Payment aborted!");
          break;
        case "PAYMENT_HANDLE_CREATED":
          break;
        case "PAYMENT_HANDLE_PAYABLE":
          break;
        default:
      }
    }
  );
};

function openPopup() {
  document.getElementsByClassName("form-pop-up")[0].style.display = "block";
  attachFormSubmitEvent();
}

function formSubmit(event) {
  var url = "/user";
  var request = new XMLHttpRequest();
  var data = new FormData(event.target);
  request.open("POST", url, true);

  request.onload = function () {
    closeForm();
    CreatePaymentHandle(data, JSON.parse(request.response));
  };

  request.onerror = function (err) {
    console.error(err);
  };

  request.send(data);
  event.preventDefault();
}

function attachFormSubmitEvent() {
  document.getElementById("SignUpform").addEventListener("submit", formSubmit);
}

function closeForm() {
  document.getElementsByClassName("form-pop-up")[0].style.display = "none";
}

function purchaseClicked() {
  var priceElement = document.getElementsByClassName("cart-total-price")[0];
  totalAmount = Math.round(priceElement.innerText.replace("$", "") * 100);

  if (totalAmount != 0) {
    openPopup();
  } else {
    alert("Cart is Empty!");
  }

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
