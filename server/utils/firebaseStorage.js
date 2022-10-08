const {initializeApp} = require("firebase/app");
const {getStorage,ref,uploadString,deleteObject,getDownloadURL} = require("firebase/storage");

const imageDir = "images";


const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();

async function uploadImage(fileBase64,fileName){
    const storageImagesRef = ref(storage,`${imageDir}/${fileName}`);
    await uploadString(storageImagesRef,fileBase64,"base64",{contentType:"image/jpeg"});
    //return the image url after uploading
    return await getImageUrl(fileName);
}
async function deleteImage(fileName){
    const storageImagesRef = ref(storage,`${imageDir}/${fileName}`);
    await deleteObject(storageImagesRef);
}
async function getImageUrl(fileName){
    const storageImagesRef = ref(storage,`${imageDir}/${fileName}`);
    return await getDownloadURL(storageImagesRef);
}

module.exports = {uploadImage,deleteImage,getImageUrl};
