import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  console.log(request);
  const body = await request.json(); // 클라이언트에서 받은 데이터

  const formData = {
    format: body.format,
    name: 'medium',
    data: null,
    url: body.url,
  };

  try {
    // 외부 API로 통신
    const response = await axios.post(
      'https://t9qn9oxuix.apigw.ntruss.com/custom/v1/31621/72abaa5dcb0754d871aa7319ed4b77d8f5e2e360f66785fc3dbad76007c6b615/general',
      {
        images: [formData],
        lang: 'ko',
        requestId: 'string',
        resultType: 'string',
        timestamp: 0,
        version: 'V1',
      },
      {
        headers: {
          'X-OCR-SECRET': `${process.env.NEXT_PUBLIC_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('텍스트 추출 결과 : ' + response);

    // 통신 성공 하면 클라이언트에서 알리기
    return new NextResponse(
      JSON.stringify({ success: true, ...response.data }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log('텍스트 추출 실패');
    console.log(error);
    return new NextResponse(JSON.stringify({ sucess: false }), {
      status: 500,
    });
  }
};
