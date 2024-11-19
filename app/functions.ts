// 숫자 자리 수 맞추는 함수
function ConvertTo2Digits(num: number): string {
  return num.toString().padStart(2, '0');
}

// Date 타입을 화면에 표시할 형식으로 변환하는 함수
export function GetTimeToText(timestamp: Date): string {
  let isAm = true;
  let hh = ConvertTo2Digits(timestamp.getHours());
  const mm = ConvertTo2Digits(timestamp.getMinutes());
  if (timestamp.getHours() > 12) {
    hh = `${ConvertTo2Digits(timestamp.getHours() - 12)}`;
  }
  if (timestamp.getHours() >= 12) {
    isAm = false;
  }

  return `${isAm ? '오전' : '오후'} ${hh}:${mm}`;
}

// 메세지 상세 내용 생성
export function CreateMsgDetail(chatText: string[], msgType: string): MsgDetail {
  return { chatText, msgType };
}

// 메세지 타입 생성
export function CreateMsgs(writer: string, msg: MsgDetail[]): MsgType {
  return { writer, msg, timestamp: new Date() };
}

// 새 메세지 타입 하나 생성
export function CreateNewMsg(writer: string, chatText: string[], msgType: string): MsgType {
  return CreateMsgs(writer, [{ chatText, msgType }]);
}

// 버튼 메세지 생성(봇)
export function CreateBotBtn(prevMsg: string, btns: string[]): MsgType {
  if (prevMsg.trim()) {
    return CreateMsgs('bot', [CreateMsgDetail([prevMsg], 'p'), CreateMsgDetail(btns, 'button')]);
  } else {
    return CreateNewMsg('bot', btns, 'button');
  }
}

// 새 메세지 생성(봇)
export function CreateBotMsg(msgs: string[]): MsgType {
  return CreateNewMsg('bot', msgs, 'p');
}

// 새 마크다운 메세지 생성(봇)
export function CreateBotMd(msgs: string, btns: string[]): MsgType {
  return CreateMsgs('bot', [CreateMsgDetail([msgs], 'markdown'), CreateMsgDetail(['다른 질문이 있으신가요?'], 'p'), CreateMsgDetail(btns, 'button')]);
}

// 새 메세지 생성(사용자)
export function CreateUserMsg(msgs: string[]): MsgType {
  return CreateNewMsg('user', msgs, 'p');
}

// 새 이미지타입 메세지 생성(사용자)
export function CreateImg(imgurl: string): MsgType {
  return CreateNewMsg('user', [imgurl], 'img');
}

// 분단위로 시간의 일치 여부 판단
function CompareTime(prevTime: Date, newTime: Date): boolean {
  if (prevTime.getMinutes() === newTime.getMinutes() && prevTime.getHours() === newTime.getHours()) {
    return true;
  } else {
    return false;
  }
}

// 가장 최근 리스트의 시간과 작성자가 같으면 이전 메세지 리스트에 추가, 시간이 다르거나 작성자가 다르다면 새로 리스트 추가
export function AddNewMsg(chatMsg: MsgType[], newMsg: MsgType): MsgType[] {
  const msgList = [...chatMsg];
  // 가장 최근 버튼을 제외하고 버튼 제거
  const result: MsgType[] = [];
  msgList.forEach((el) => {
    const msgbox: MsgDetail[] = [];
    el.msg.forEach((msg) => {
      if (msg.msgType !== 'button') {
        msgbox.push(msg);
      }
    });
    if (msgbox.length > 0) {
      result.push({ writer: el.writer, msg: msgbox, timestamp: el.timestamp });
    }
  });
  if (result.length > 0) {
    const lastMsg = result[result.length - 1];
    if (newMsg.writer === lastMsg.writer && CompareTime(lastMsg.timestamp, newMsg.timestamp)) {
      lastMsg.msg.push(...newMsg.msg);
      result.pop();
      result.push(lastMsg);
    } else {
      result.push(newMsg);
    }
  } else {
    result.push(newMsg);
  }
  return result;
}

// 버튼 클릭 시 유저 메세지에 버튼명 추가 후 답변
export function clickBtn(chatMsg: MsgType[], btn: string, answer: string): MsgType[] {
  if (answer.trim()) {
    return [...AddNewMsg(chatMsg, { writer: 'user', msg: [{ chatText: [btn], msgType: 'p' }], timestamp: new Date() }), CreateBotMsg([answer])];
  } else {
    return AddNewMsg(chatMsg, { writer: 'user', msg: [{ chatText: [btn], msgType: 'p' }], timestamp: new Date() });
  }
}
