import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../App.css'; 

const MySwal = withReactContent(Swal);

export const showDeleteConfirmation = (title, text, onConfirm) => {
  MySwal.fire({
    html: `
      <div class="flex items-start text-left space-x-4">
        <span class="swal2-icon swal2-warning icon-small"></span>
        <div>
          <h2 class="text-xl font-semibold">${title}</h2>
          <p>${text}</p>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonColor: '#DF6139',
    cancelButtonColor: '#80876E',
    confirmButtonText: 'Yes, delete it!',
    customClass: {
      popup: 'swal2-popup',
      content: 'swal2-content',
      cancelButton: 'swal2-cancel',
      confirmButton: 'swal2-confirm',
    },
    buttonsStyling: false,
    focusConfirm: false,
    showClass: {
      popup: 'ease-out duration-300 transform opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95',
      backdrop: 'ease-out duration-300 opacity-0'
    },
    hideClass: {
      popup: 'ease-in duration-200 transform translate-y-4 sm:translate-y-0 sm:scale-95',
      backdrop: 'ease-in duration-200 opacity-100'
    },
    backdrop: 'bg-gray-500 bg-opacity-75 transition-opacity',
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}
