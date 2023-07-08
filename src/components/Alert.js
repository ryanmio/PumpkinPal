import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../App.css'; 

const MySwal = withReactContent(Swal);

export const showDeleteConfirmation = (title, text, onConfirm) => {
  MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#DF6139',
    cancelButtonColor: '#80876E',
    confirmButtonText: 'Confirm Delete',
    customClass: {
      popup: 'swal2-popup',
      title: 'swal2-title',
      cancelButton: 'swal2-cancel',
      confirmButton: 'swal2-confirm',
    }
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}
