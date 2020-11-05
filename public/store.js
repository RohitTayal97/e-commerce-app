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

const PAYSAFE_ENCODED_PUBLIC_KEY =
  "cHVibGljLTc3NTE6Qi1xYTItMC01ZjAzMWNiZS0wLTMwMmQwMjE1MDA4OTBlZjI2MjI5NjU2M2FjY2QxY2I0YWFiNzkwMzIzZDJmZDU3MGQzMDIxNDUxMGJjZGFjZGFhNGYwM2Y1OTQ3N2VlZjEzZjJhZjVhZDEzZTMwNDQ=";
var totalAmount = 0;
var singleUseCustomerToken = null;

const createSingleUseCustomerToken = (customerId) => {
  var request = new XMLHttpRequest();
  request.open("POST", "/createtoken", false);
  request.setRequestHeader("Content-type", "application/json");
  request.send(
    JSON.stringify({
      customerId: customerId,
    })
  );

  singleUseCustomerToken = JSON.parse(request.response).singleUseCustomerToken;
};

const CreatePaymentHandle = (userObj, userIds) => {
  if (userIds.customerId) {
    createSingleUseCustomerToken(userIds.customerId);
  }

  const year = parseInt(userObj.get("dateOfBirth").substr(0, 4));
  const month = parseInt(userObj.get("dateOfBirth").substr(5, 2));
  const day = parseInt(userObj.get("dateOfBirth").substr(8));

  paysafe.checkout.setup(
    PAYSAFE_ENCODED_PUBLIC_KEY,
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
        card: {},
      },
    },
    function (instance, error, result) {
      if (result && result.paymentHandleToken) {
        var request = new XMLHttpRequest();
        request.open("POST", "/payment", true);
        request.setRequestHeader("Content-type", "application/json");
        request.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            if (instance.isOpen()) {
              instance.showSuccessScreen();
              setTimeout(function () {
                instance.close();
              }, 3000);
            } else {
              alert(`Payment of ${totalAmount / 100} is Successful!`);
            }
          } else if (this.status != 200) {
            alert("Payment Declined!");
          }
        };
        const reqObj = {
          amount: totalAmount,
          customerOperation: result.customerOperation,
          customerId: userIds.customerId,
          merchantCustomerId: userIds.merchantCustomerId,
          paymentHandleToken: result.paymentHandleToken,
        };
        request.send(JSON.stringify(reqObj));
      } else {
        if (instance) {
          instance.showFailureScreen();
          setTimeout(function () {
            instance.close();
          }, 3000);
        } else {
          alert(error.detailedMessage);
        }
      }
      stopLoading();
    },
    function (stage, expired) {
      totalAmount = 0;
      singleUseCustomerToken = null;

      if (expired) {
        return;
      }
      switch (stage) {
        case "PAYMENT_HANDLE_NOT_CREATED":
          alert("Payment aborted!");
          stopLoading();
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

function openForm() {
  document.getElementsByClassName("form-container")[0].style.display = "block";
  attachFormSubmitEvent();
}

function startLoading() {
  document.getElementsByClassName("loading-container")[0].style.display =
    "block";
}

function stopLoading() {
  document.getElementsByClassName("loading-container")[0].style.display =
    "none";
}

function formSubmit(event) {
  var url = "/user";
  var request = new XMLHttpRequest();
  var data = new FormData(event.target);
  request.open("POST", url, true);

  request.onload = function () {
    closeForm();
    startLoading();
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
  document.getElementsByClassName("form-container")[0].style.display = "none";
}

function purchaseClicked() {
  var priceElement = document.getElementsByClassName("cart-total-price")[0];
  totalAmount = Math.round(priceElement.innerText.replace("$", "") * 100);

  if (totalAmount != 0) {
    openForm();
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
  var cartItemContainer = document.getElementsByClassName("cart-items")[0];
  var cartRows = cartItemContainer.getElementsByClassName("cart-row");
  for (var i = 0; i < cartRows.length; i++) {
    if (cartRows[i].dataset.itemId == id) {
      cartRows[i].getElementsByClassName("cart-quantity-input")[0].value++;
      return;
    }
  }

  var cartRow = document.createElement("div");
  cartRow.classList.add("cart-row");
  cartRow.dataset.itemId = id;

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
  cartItemContainer.append(cartRow);
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
