import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Apply the styles for SweetAlert2
import './app.css';

const MySwal = withReactContent(Swal);

export const showDeleteConfirmation = (title, text, onConfirm) => {
  MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DF6139',
    cancelButtonColor: '#80876E',
    confirmButtonText: 'Yes, delete it!',
    customClass: {
      popup: 'swal2-popup',
      icon: 'swal2-icon',
      title: 'swal2-title',
      cancelButton: 'swal2-cancel',
      confirmButton: 'swal2-confirm',
      confirmButton: 'swal2-styled',
      cancelButton: 'swal2-styled'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}
