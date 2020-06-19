function generateCard(title, cost) {
  var cardInnerHTML = `
  <div class="card-body">
    <div class="row no-gutters align-items-center">
      <div class="col mr-2">
        <div class="text-xs font-weight-bold text-success text-uppercase mb-1">${title}</div>
        <div class="h5 mb-0 font-weight-bold text-gray-800">${cost}LE</div>
      </div>
      <div class="col-auto">
        <i class="fas fa-dollar-sign fa-2x text-gray-300"></i>
      </div>
    </div>
  </div>
  `;

  var cardContainer = document.createElement('div');
  cardContainer.classList = 'card border-left-success shadow h-100 py-2';
  cardContainer.innerHTML = cardInnerHTML;
  return cardContainer;
}

function generateOwnerListElement(name, onRemoveCallback) {
  return `
    <div class="d-flex flex-row align-items-center justify-content-between">
      <span>${name}</span>
      <a class="btn-sm btn-clear btn-circle" onclick="${onRemoveCallback}">
        <i class="fas fa-ban"></i>
      </a>
    </div>
  `;
}
function generateOwnerListElement(name, icon, onRemoveCallback) {
  return `
    <div class="d-flex flex-row align-items-center justify-content-between">
      <span>${name}</span>
      <a class="btn-sm btn-clear btn-circle" onclick="${onRemoveCallback}">
        <i class="fas fa-${icon}"></i>
      </a>
    </div>
  `;
}

function generateOwnerMatchCard(owner, onClickCallback) {
  return `
  <div class="search-match" onclick="${onClickCallback}">
      <div>${owner.name}</div>
      <div class="small text-gray-500 ml-3">Flat Number - ${owner.flatNumber}</div>
      <div class="small text-gray-500  ml-3">Phone Number - ${owner.phoneNumber}</div>
  </div>
  `
}

function generateCCMatchCard(costCenter, onClickCallback) {
  return `
  <div class="search-match" onclick="${onClickCallback}">
      <div>${costCenter.name}</div>
      <div class="small text-gray-500 ml-3">${costCenter.description}</div> 
  </div>
  `
}

