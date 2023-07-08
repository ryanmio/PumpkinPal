import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import '../App.css'; 

export const showDeleteConfirmation = (title, text, onConfirm) => {
  Swal.fire({
    title: `<div class="flex items-center">
              <div class="icon">
                <i class="fas fa-exclamation-circle"></i>
              </div>
              <div>${title}</div>
            </div>`,
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#80876E',
    confirmButtonText: 'Yes, delete it!',
  }).then((result) => {
    if (result.isConfirmed) {
      onConfirm();
    }
  });
}
