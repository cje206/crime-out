'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { getExample, isCrime, getGemini } from './api/gemini';
import { handleImageUpload, uploadImage } from './api/uploadImage';
import ReactMarkdown from 'react-markdown';
import { AddNewMsg, clickBtn, CreateBotBtn, CreateBotMd, CreateImg, CreateUserMsg, GetTimeToText } from './functions';
import { toast, ToastContainer } from 'react-toastify';
import { PhotoIcon, XMarkIcon, PlusIcon, MinusIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import Logo from '../public/crimeout-logo.svg';
import 'react-toastify/dist/ReactToastify.css';

export default function Test() {
  // 초기 메뉴
  const initialList = ['피싱, 스미싱 문자 확인하기', '최근 피싱, 스미싱 사례 확인하기', '크아에게 질문하기(피싱, 스미싱 관련)'];
  // 문자 확인 메뉴
  const checkMsgList = ['문자 내용 입력하기', '문자 이미지 업로드하기'];

  // +버튼 활성화 여부
  const [plusActive, setPlusActive] = useState<boolean>(false);

  // 파일 선택 활성화 여부
  const [uploadActive, setUploadActive] = useState<boolean>(false);

  // 전송 버튼 활성화 여부
  const [isActive, setIsActive] = useState<boolean>(false);
  // 전송버튼 클릭 시 수행 할 함수
  const [func, setFunc] = useState<number>(0);

  // 텍스트 줄
  const [textRow, setTextRow] = useState<number>(1);
  // 줄바꿈 위치
  const [lineBreak, setLineBreak] = useState<number[]>([]);

  // 화면에 보여줄 채팅 메세지 리스트
  const [chatMsg, setChatMsg] = useState<MsgType[]>([
    {
      writer: 'bot',
      msg: [
        { chatText: ['원하시는 메뉴를 선택해주세요.'], msgType: 'p' },
        { chatText: initialList, msgType: 'button' },
      ],
      timestamp: new Date(),
    },
  ]);

  const [inputMsg, setInputMsg] = useState<string>('');

  // 로딩 중 노출 여부
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 스크롤 될 위치
  const scrollRef = useRef<HTMLDivElement>(null);

  // 타이핑 위치
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 업로드 후 화면에 보여줄 이미지
  const [image, setImage] = useState<string>('');
  // 업로드한 이미지 파일
  const [imageFile, setImageFile] = useState<File>();

  // CASE 1. 피싱 확률 (메세지 입력)
  const geminiFunc1 = async (text: string) => {
    // isCrime(피싱 메세지 내용) : return값으로 피싱 확률 전달
    setChatMsg(AddNewMsg(AddNewMsg([...chatMsg], CreateUserMsg([text])), CreateBotMd(await isCrime(text), initialList)));
    setInputMsg('');
    setIsActive(false);
    setTextRow(1);
    setLineBreak([]);
  };

  // CASE 2. 피싱 확률(이미지 첨부)
  const geminiFunc2 = async () => {
    // uploadImage(이미지 파일) : firebase에 이미지 파일을 업로드하고 return 값으로 피싱 확률 전달
    if (imageFile) {
      setPlusActive(false);
      setChatMsg(AddNewMsg(AddNewMsg([...chatMsg], CreateImg(image)), CreateBotMd(await uploadImage(imageFile), initialList)));
      setImage('');
    }
  };

  // CASE 3. 사례 확인
  const geminiFunc3 = async () => {
    // getExample() : return값으로 최근 피싱 사례 호출
    setChatMsg(AddNewMsg(clickBtn([...chatMsg], initialList[1], ''), CreateBotMd(await getExample(), initialList)));
    // setAnswer();
  };

  // CASE 4. 크아에게 질문하기
  const geminiFunc4 = async (text: string) => {
    // isCrime(피싱 메세지 내용) : return값으로 피싱 확률 전달
    setChatMsg(AddNewMsg(AddNewMsg([...chatMsg], CreateUserMsg([text])), CreateBotMd(await getGemini(text), initialList)));
    setInputMsg('');
    setIsActive(false);
    setTextRow(1);
    setLineBreak([]);
  };

  // 메세지 추가(전송 버튼 클릭)
  const sendMsg = () => {
    switch (func) {
      case 1:
        if (!inputMsg.trim()) {
          toast.error('메세지를 입력해주세요.', { autoClose: 1500 });
          inputRef?.current?.focus();
          return;
        }
        setTextRow(1);
        setLineBreak([]);
        const text1 = inputMsg;
        setChatMsg(AddNewMsg([...chatMsg], CreateUserMsg([text1])));
        setInputMsg('');
        geminiFunc1(text1);
        break;
      case 2:
        if (!imageFile || !image.trim()) {
          toast.error('이미지를 업로드해주세요.', { autoClose: 1500 });
          return;
        }
        setChatMsg(AddNewMsg([...chatMsg], CreateImg(image)));
        geminiFunc2();
        break;
      case 3:
        geminiFunc3();
        break;
      case 4:
        if (!inputMsg.trim()) {
          toast.error('메세지를 입력해주세요.', { autoClose: 1500 });
          inputRef?.current?.focus();
          return;
        }
        setTextRow(1);
        setLineBreak([]);
        const text2 = inputMsg;
        setChatMsg(AddNewMsg([...chatMsg], CreateUserMsg([text2])));
        setInputMsg('');
        geminiFunc4(text2);
        break;

      default:
        break;
    }
  };

  // 버튼 클릭 시 동작
  const btnFunc = (chatting: string) => {
    switch (chatting) {
      // 문자 확인
      case initialList[0]:
        setChatMsg(AddNewMsg(clickBtn([...chatMsg], initialList[0], ''), CreateBotBtn('', checkMsgList)));
        break;
      // 사례 확인
      case initialList[1]:
        setChatMsg(clickBtn([...chatMsg], initialList[1], ''));
        geminiFunc3();
        break;
      // 크아에게 질문
      case initialList[2]:
        setChatMsg(clickBtn([...chatMsg], initialList[2], '질문 내용을 입력해주세요.'));
        setFunc(4);
        setIsActive(true);
        break;
      // 문자내용 입력
      case checkMsgList[0]:
        setChatMsg(clickBtn([...chatMsg], checkMsgList[0], '문자 내용을 입력해주세요.'));
        setFunc(1);
        setIsActive(true);
        break;
      // 문자 이미지 업로드
      case checkMsgList[1]:
        setChatMsg(clickBtn([...chatMsg], checkMsgList[1], '+ 버튼을 클릭해 이미지를 업로드해주세요.'));
        setFunc(2);
        setPlusActive(true);
        break;
      default:
        break;
    }
  };

  const checkLoading = () => {
    if (chatMsg.length > 0) {
      if (chatMsg[chatMsg.length - 1].writer === 'bot') {
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    }
  };
  const scrollBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      });
    }
  };

  // 타입에 따라 화면에 다르게 노출되도록 설정
  const checkType = (type: string, msg: string[], keyName: string, writer: string): ReactElement => {
    if (type === 'button') {
      return (
        <div key={keyName} className="flex flex-wrap">
          {msg.map((chatting, index) => (
            <button
              key={`${keyName} detail${index}`}
              onClick={() => btnFunc(chatting)}
              type="button"
              className="py-1 px-3 mr-2 border border-blue-300 text-blue-700 rounded-md mb-2"
            >
              {chatting}
            </button>
          ))}
        </div>
      );
    } else if (type === 'markdown') {
      return (
        <div key={keyName}>
          {msg.map((chatting, index) => (
            <ReactMarkdown key={`${keyName} detail${index}`} className="p-2 bg-slate-200 rounded-md mb-2">
              {chatting}
            </ReactMarkdown>
          ))}
        </div>
      );
    } else if (type === 'img') {
      return (
        <div key={keyName}>
          {msg.map((chatting, index) => (
            <img src={chatting} alt="문자 이미지" key={`${keyName} detail${index}`} className="shadow" />
          ))}
        </div>
      );
    } else {
      return (
        <div key={keyName} className={`flex ${writer === 'bot' ? 'justify-start' : 'justify-end'}`}>
          {msg.map((chatting, index) => (
            <p
              key={`${keyName} detail${index}`}
              className={`p-2 rounded-lg mb-2 ${writer === 'bot' ? 'bg-slate-200 rounded-tl-none' : 'bg-blue-600 text-white rounded-br-none break-words'}`}
            >
              {chatting}
            </p>
          ))}
        </div>
      );
    }
  };
  useEffect(() => {
    checkLoading();
    scrollBottom();
  }, [chatMsg]);
  useEffect(() => {
    scrollBottom();
  }, [isLoading]);

  return (
    <>
      <ToastContainer className={'set-font'} />
      <div className="screen-size flex flex-col justify-between w-full h-full min-h-screen">
        <div>
          <div className="screen-size sticky flex top-0 w-full h-12 bg-white border-b border-b-slate-200 z-50 items-center px-4">
            <Logo height="36px" />
            <div className="px-2">채팅 중</div>
            <span className="block w-2 h-2 bg-green-500 rounded-full"></span>
          </div>
          <div className="chatlist w-full h-full px-4 pt-3">
            {chatMsg.map((chat, index) => (
              <div key={`chat${index}`} className="relative">
                {chat.writer === 'bot' && (
                  <div className="w-10 h-10 rounded-full overflow-hidden absolute top-0 left 0">
                    <img src="./profile.webp" alt="프로필 사진" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`flex flex-col mb-3 ${chat.writer === 'bot' ? 'items-start ml-12' : 'items-end'}`}>
                  {chat.writer === 'bot' && <div>크아</div>}
                  <div className={`chatting-box flex flex-col ${chat.writer === 'bot' ? 'items-start' : 'items-end'}`}>
                    <div>{chat.msg.map((msg, index2) => checkType(msg.msgType, msg.chatText, `chat${index} msg${index2}`, chat.writer))}</div>
                    <div className="text-xs text-slate-400">{GetTimeToText(chat.timestamp)}</div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="relative flex flex-col items-start pl-12">
                <div className="w-10 h-10 rounded-full overflow-hidden absolute top-0 left-0">
                  <img src="./profile.webp" alt="프로필 사진" className="w-full h-full object-cover" />
                </div>
                <div>크아</div>
                <div className="p-2 rounded-lg mb-2 bg-slate-200 rounded-tl-none">
                  <div className="chatMsg loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="screen-size sticky bottom-0 w-full min-h-12 bg-white">
          {plusActive && image && (
            <div className="relative w-full border-t border-t-slate-200 bg-white">
              <img src={image} className="img-thumb p-4" />
              <XMarkIcon
                className="absolute top-3 right-3 w-6 text-slate-300"
                onClick={() => {
                  setImage('');
                }}
              />
            </div>
          )}
          {uploadActive && (
            <div className="upload-image absolute border border-slate-200 rounded-xl shadow-lg bg-white">
              <input
                type="file"
                accept="image/*"
                id="imageFile"
                onChange={(e) => {
                  if (e.target.files) {
                    setImageFile(e.target.files[0]);
                    handleImageUpload(e.target.files[0], setImage);
                    setUploadActive(false);
                  }
                }}
                className="hide"
              />
              <label htmlFor="imageFile" className="flex p-3">
                <PhotoIcon className="size-6 mr-2" />
                사진 업로드
              </label>
            </div>
          )}
          {/* x-center  */}
          <div className="relative w-full border-t border-t-slate-200">
            <button
              type="button"
              disabled={!plusActive}
              onClick={() => setUploadActive(!uploadActive)}
              className={`w-8 h-8 rounded-full absolute y-center left-2 border ${plusActive ? 'text-blue-600 border-blue-300' : 'text-slate-200  border-slate-200'}`}
            >
              {uploadActive ? <MinusIcon className="w-6 m-auto" /> : <PlusIcon className="w-6 m-auto" />}
            </button>
            <div className="mx-12 py-3">
              <textarea
                name="chat"
                id="chat"
                placeholder="채팅 내용을 입력해주세요"
                value={inputMsg}
                onChange={(e) => {
                  const { value, scrollHeight, clientHeight } = e.target;
                  setInputMsg(value);
                  console.log(e.target.cols);
                  if (lineBreak.length > 0) {
                    const newLineBreak = lineBreak.filter((point) => point < value.length + 1);
                    setLineBreak(newLineBreak);
                    setTextRow(newLineBreak.length + 1);
                  }
                  if (scrollHeight > clientHeight) {
                    if (clientHeight < 72) {
                      setTextRow(textRow + 1);
                      setLineBreak([...lineBreak, value.length]);
                    }
                  }
                }}
                style={{ resize: 'none' }}
                disabled={!isActive}
                ref={inputRef}
                rows={textRow}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMsg();
                }}
                className="min-h-6 overflow-auto w-full px-2 m-none leading-6"
              ></textarea>
            </div>

            <button
              type="button"
              disabled={!((isActive && Boolean(inputMsg.trim())) || (Boolean(image) && Boolean(imageFile)))}
              onClick={sendMsg}
              className={`w-8 h-8 rounded-full absolute y-center right-2 ${
                !((isActive && Boolean(inputMsg.trim())) || (Boolean(image) && Boolean(imageFile))) ? 'bg-slate-200' : 'bg-blue-600'
              } text-white`}
            >
              <PaperAirplaneIcon className="w-6 pl-1 m-auto" />
            </button>
          </div>
        </div>
      </div>
      <div ref={scrollRef}></div>
    </>
  );
}
