document.addEventListener("DOMContentLoaded", function () {
    let typeList = document.querySelector("#accountTypeList");
  
    if (typeList) {
      typeList.addEventListener("change", function () {
        let type = typeList.value;
        if (!type) return;
  
        fetch(`/account/getAccounts/${type}`)
          .then((res) => res.json())
          .then((data) => buildAccountList(data))
          .catch((error) => console.error("Error:", error));
      });
    }
  });
  
  function buildAccountList(data) {
    let display = document.getElementById("accountDisplay");
  
    let table = "<thead><tr><th>First Name</th><th>Last Name</th><th>Type</th></tr></thead><tbody>";
  
    data.forEach((acc) => {
      table += `<tr><td>${acc.account_firstname}</td><td>${acc.account_lastname}</td><td>${acc.account_type}</td></tr>`;
    });
  
    table += "</tbody>";
    display.innerHTML = table;
  }