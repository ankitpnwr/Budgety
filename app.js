var budgetController = (function () {
  var Expence = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expence.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0)
      this.percentage = Math.round((this.value / totalIncome) * 100);
    else this.percentage = -1;
  };

  Expence.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: function (type, des, val) {
      var newItem, ID;

      // ID = last ID + 1
      //Create Unique ID
      if (data.allItems[type].length > 0) {
        // ID = exp[n-1].id + 1 || ID = inc[n-1].id + 1
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new items based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expence(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      //Return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      // id = 6
      // data.allItems[type][ID]
      // ids = [1, 2, 4, 6, 8]
      // index = 3

      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // 1. Calculate Total Income and Expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // 2. Calculate  Budget: Income - Expenses
      data.budget = data.totals.inc - data.totals.exp;

      // 3. Calculate Percentage
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      /*
        a = 20
        b = 18
        income = 100
        a = 20/100 = 20%
        b = 10/100 = 10%
      */
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allperc = data.allItems.exp.map(function (cur) {
        return cur.getPercentage();
      });
      return allperc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalExp: data.totals.exp,
        totalInc: data.totals.inc,
        percentage: data.percentage,
      };
    },

    testing: function () {
      console.log(data);
    },
  };
})();

var UIController = (function () {
  var DomString = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    displayCalcPercentage: ".item__percentage",
    displayDate: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit, int, dec;
    /*
      + or -before number
      exactly 2 decial points
      comma separating the thousands
      for ex : 
      2310.4567 = + 2,310.46
    */
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3); // input 23510 = 23,510
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DomString.inputType).value, //either be 'exp' or 'inc'
        description: document.querySelector(DomString.inputDescription).value,
        value: parseFloat(document.querySelector(DomString.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      // 1. Create a html string with placeholder text
      if (type === "exp") {
        element = DomString.expensesContainer;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description" >%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div > ';
      } else if (type === "inc") {
        element = DomString.incomeContainer;

        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description" >%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
      }
      // 2. Replace the html string with actual text
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      // 3. Insert html in Dom
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearField: function () {
      var fields, fieldArr;

      fields = document.querySelectorAll(
        DomString.inputDescription + "," + DomString.inputValue
      );

      fieldArr = Array.prototype.slice.call(fields);

      fieldArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldArr[0].focus();
    },

    diplayBudget: function (obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DomString.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DomString.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DomString.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DomString.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DomString.percentageLabel).textContent = "---";
      }
    },

    displayPercentage: function (percentages) {
      var fields = document.querySelectorAll(DomString.displayCalcPercentage);

      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displaydate: function () {
      var now, months, month, year;
      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DomString.displayDate).textContent =
        months[month] + " " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DomString.inputType +
          "," +
          DomString.inputDescription +
          "," +
          DomString.inputValue0
      );
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });
      document.querySelector(DomString.inputBtn).classList.toggle("red");
    },

    getDomString: function () {
      return DomString;
    },
  };
})();

var appController = (function (budgetCtrl, UICtrl) {
  var setupEventListeners = function () {
    var Dom = UICtrl.getDomString();

    document.querySelector(Dom.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(Dom.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(Dom.inputType)
      .addEventListener("change", UICtrl.changedType);
  };

  var updateBudget = function () {
    // 1. Calculate Budget
    budgetCtrl.calculateBudget();

    // 2. Return Budget
    var budget = budgetCtrl.getBudget();

    // 3. Display Budget in UI
    UICtrl.diplayBudget(budget);
  };

  var updatePercentage = function () {
    // 1. Calculate Percentage
    budgetCtrl.calculatePercentages();

    // 2. Read percentage from the budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentage
    UICtrl.displayPercentage(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get the field input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear field
      UICtrl.clearField();

      // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update percentage
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function (e) {
    var itemID, splitID;
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      //inc-1
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();

      // 4. Calculate and update percentage
      updatePercentage();
    }
  };

  return {
    init: function () {
      console.log("Application has started.");
      UICtrl.displaydate();
      UICtrl.diplayBudget({
        budget: 0,
        totalExp: 0,
        totalInc: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
})(budgetController, UIController);

appController.init();
