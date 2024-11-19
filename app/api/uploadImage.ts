import {
  getDownloadURL,
  uploadBytes,
  ref,
  getMetadata,
} from 'firebase/storage';
import { storage } from '../../config/Firebase';
import axios from 'axios';
import { isCrime } from './gemini';

export const uploadImage = async (file: File): Promise<string> => {
  if (!file) return '';
  const nowDate = new Date();
  const imageRef = ref(
    storage,
    `profileImages/${nowDate.getFullYear()}${nowDate.getMonth() + 1}${nowDate.getHours()}${nowDate.getMinutes()}${nowDate.getTime()}`
  ); // 스토리지 내의 저장 경로를 지정
  await uploadBytes(imageRef, file); // 파일을 업로드
  const url = await getDownloadURL(imageRef); // 업로드된 파일의 URL 가져옴
  const format = await getMetadata(imageRef);
  if (format.contentType) {
    const res = await axios.post('http://localhost:3000/api', {
      url,
      format: format.contentType.replace('image/', ''),
    });
    console.log(res.data.images[0].fields);
    let result = '';
    if (res.data.images[0].fields) {
      if (res.data.images[0].fields.length > 0) {
        res.data.images[0].fields?.forEach((data: { inferText: string }) => {
          console.log(data.inferText);
          result += `${data.inferText} `;
        });
      }
    }
    return await isCrime(result);
  }
  return '';
};

export const handleImageUpload = (
  file: File,
  func: React.Dispatch<React.SetStateAction<string>>
) => {
  if (!file) return;

  // 미리보기 URL 생성 및 저장
  const reader = new FileReader();
  reader.onloadend = () => {
    func(reader.result as string);
  };
  reader.readAsDataURL(file);
};
