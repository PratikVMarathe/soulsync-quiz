import { useId, useState } from 'react';
import { getQuizVisual } from '../data/quizVisuals';

const symbolPaths = {
  balance: 'M304 470h32M320 398v160M248 438h144M248 438l-58 92h116l-58-92ZM392 438l-58 92h116l-58-92Z',
  book: 'M236 382c44 0 69 12 84 31 15-19 40-31 84-31v184c-44 0-69 12-84 31-15-19-40-31-84-31V382Z',
  breath: 'M230 510c48-48 132-48 180 0M260 460c34-34 86-34 120 0M288 410c18-18 46-18 64 0',
  cloud: 'M218 520h202c37 0 66-24 66-55 0-28-24-51-56-54-15-37-52-62-96-62-57 0-104 41-104 92-38 3-68 36-68 75 0 2 0 3 1 4Z',
  flame: 'M321 605c62-28 94-72 94-129 0-53-35-95-78-127 3 39-18 69-43 86 4-69-28-120-82-166 10 68-57 108-57 184 0 94 70 153 166 152Z',
  heart: 'M320 578 205 470c-35-34-35-88 0-121 32-30 83-29 115 3 32-32 83-33 115-3 35 33 35 87 0 121L320 578Z',
  lotus: 'M 320 590 c -92 -51 -119 -123 -84 -214 c 48 20 79 62 84 129 c 5 -67 36 -109 84 -129 c 35 91 8 163 -84 214 Z M 320 467 c -42 -62 -41 -107 0 -176 c 40 65 38 121 0 176 Z M 320 589 c -66 -9 -189 -12 -203 -164 c 59 -4 101 17 107 51 M 322 590 c 65 -11 176 -11 193 -171 c -59 -4 -92 16 -98 49',
  moon: 'M405 523c-76 32-164-24-164-107 0-54 37-101 89-113-18 24-27 53-23 84 8 70 54 116 98 136Z',
  mountain: 'M164 560 284 360l61 100 45-67 86 167H164Z',
  path: 'M207 592c45-107 89-181 132-222 38 51 60 125 66 222M247 526h146M274 464h92',
  sun: 'M 320 504 a 78 78 0 1 0 0 -156 a 78 78 0 0 0 0 156 Z M 320 329 v -58 M 321 579 v -58 M 220 419 h -58 M 478 421 h -58 M 246 360 l -41 -41 M 446 517 l -41 -41 M 388 353 l 41 -41 M 192 517 l 41 -41',
  temple: 'M196 560h248M220 510h200M244 510V394M320 510V394M396 510V394M210 394h220L320 316 210 394Z',
  tree: 'M 320 600 V 435 M 321 434 C 215 432 191 397 199 350 c 51 -10 93 15 89 17 M 322 434 C 432 430 465 399 460 351 c -66 -13 -112 12 -108 16 M 320 434 c -41 -41 -42 -103 0 -153 c 42 50 41 112 0 153 Z',
};

export default function QuizIntroVisual({ imageUrl, visualKey, alt }) {
  const [imageFailed, setImageFailed] = useState(false);
  const id = useId().replace(/:/g, '');
  const visual = getQuizVisual(visualKey);
  const [light, mid, dark] = visual.colors;

  if (imageUrl && !imageFailed) {
    return (
      <img
        alt={alt}
        onError={() => setImageFailed(true)}
        src={imageUrl}
      />
    );
  }

  return (
    <svg
      aria-label={visual.label}
      className="quiz-intro-svg"
      role="img"
      viewBox="0 0 640 1080"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".56" stopColor="#f8f5e9" />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx=".72" cy=".22" r=".32">
          <stop offset="0" stopColor="#fff8d7" />
          <stop offset=".42" stopColor={light} />
          <stop offset="1" stopColor={light} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect fill={`url(#${id}-sky)`} height="1080" width="640" />
      <circle cx="460" cy="215" fill={`url(#${id}-sun)`} r="205" />
      {/* <path d="M 231 408 l 83 -94 l 184 170 H 164 Z" fill={dark} opacity=".25" />
      <path d="M164 456 295 260l78 120 83-94 184 170H164Z" fill={dark} opacity=".18 " /> */}
      
      
      <path d="M0 621c88-38 170-49 246-33 90 18 165 14 222-15 66-33 123-37 172-11v518H0V621Z" fill="#eff4eb" opacity=".88" />
      <path d="M0 706c85-35 178-38 279-9 92 27 212 18 361-27v410H0V706Z" fill={mid} opacity=".42" />
      <path d="M0 802c108-31 216-31 324 0s213 32 316 2v276H0V802Z" fill="#f9f7ee" opacity=".72" />
      <g fill="none" stroke={dark} strokeLinecap="round" strokeLinejoin="round" strokeWidth="20">
        <path d={symbolPaths[visual.symbol]} />
      </g>
      {/* <path d="M46 115c78 9 131 42 159 99M42 172c79 14 130 47 153 99M495 76c-63 18-100 53-112 105" fill="none" opacity=".26" stroke={dark} strokeLinecap="round" strokeWidth="19" /> */}
      <circle cx="520" cy="140" fill={light} opacity=".75" r="6" />
      <circle cx="548" cy="168" fill={light} opacity=".75" r="4" />
      {/* <path d="M112 736c142-30 276-30 416 0" fill="none" opacity=".24" stroke={dark} strokeLinecap="round" strokeWidth="9" /> */}
    </svg>
  );
}
