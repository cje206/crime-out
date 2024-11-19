interface MsgType {
  writer: string;
  msg: MsgDetail[];
  timestamp: Date;
}

interface MsgDetail {
  chatText: string[];
  msgType: string;
}
