const Notify = {
  toast(message, type='success'){
    const colors = {
      success:'text-bg-success',
      danger:'text-bg-danger',
      warning:'text-bg-warning',
      info:'text-bg-primary'
    };
    const icons = {
      success:'bi-check-circle-fill',
      danger:'bi-x-circle-fill',
      warning:'bi-exclamation-triangle-fill',
      info:'bi-info-circle-fill'
    };
    const id = 'toast_'+Date.now();
    const html = `
      <div id="${id}" class="toast align-items-center ${colors[type]} border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body">
            <i class="bi ${icons[type]} me-1"></i> ${Utils.escapeHtml(message)}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>`;
    document.getElementById('toastContainer').insertAdjacentHTML('beforeend', html);
    const el = document.getElementById(id);
    const t = new bootstrap.Toast(el, {delay:3000});
    t.show();
    el.addEventListener('hidden.bs.toast', ()=>el.remove());
  }
};