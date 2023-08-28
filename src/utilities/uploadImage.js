import { getDoc, doc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-hot-toast';

const uploadImage = async (file, pumpkinId, userId, db, storage) => {
  try {
    const storagePath = `UserImages/${pumpkinId}/${file.name}`;
    const fileExtension = file.name.split('.').pop();
    const thumbnailPath = storagePath.replace(`.${fileExtension}`, '_680x680.webp');
    const storageRef = ref(storage, storagePath);
    const metadata = { contentType: file.type };
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Toast for upload started
    const uploadToastId = toast.loading('Uploading image...');

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          toast.loading(`Uploading: ${Math.round(progress)}%`, { id: uploadToastId });
        },
        (error) => {
          toast.error('Failed to upload image.');
          reject(error);
        },
        async () => {
          toast.dismiss(uploadToastId);
          const processingToastId = toast.loading('Processing thumbnail...');
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const checkThumbnail = async () => {
            try {
              const thumbnailRef = ref(storage, thumbnailPath);
              const thumbnailURL = await getDownloadURL(thumbnailRef);

              const usersCollection = collection(db, 'Users');
              const userDoc = doc(usersCollection, userId);
              const pumpkinsCollection = collection(userDoc, 'Pumpkins');
              const pumpkinRef = doc(pumpkinsCollection, pumpkinId);

              const pumpkinDoc = await getDoc(pumpkinRef);
              const currentImages = pumpkinDoc.data().images || [];
              const newImage = { original: downloadURL, thumbnail: thumbnailURL };
              const updatedImages = [...currentImages, newImage];

              await updateDoc(pumpkinRef, { images: updatedImages });

              toast.dismiss(processingToastId);
              toast.success('Image uploaded successfully.');
              resolve(updatedImages);
            } catch (error) {
              setTimeout(checkThumbnail, 1000);
            }
          };

          checkThumbnail();
        }
      );
    });
  } catch (error) {
    toast.error('Upload failed.');
    throw error;
  }
};

export default uploadImage;