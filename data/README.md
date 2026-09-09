# Secure Server Guard

Node.js와 Express를 기반으로 구현한 **방어형 서버 보안 모니터링 프로젝트**입니다.
로그인 보안, 무차별 대입(Brute-force) 탐지, 요청 제한, 감사 로그와 보안 대시보드를 구현했습니다.

> 본 프로젝트는 공격 도구가 아니라 서버 보안 방어 기법을 학습하고 시각화하기 위한 포트폴리오 프로젝트입니다.

## 주요 기능

- bcrypt 기반 비밀번호 해싱
- JWT 인증 + HttpOnly / SameSite 쿠키
- Helmet 기반 HTTP 보안 헤더
- 전체 요청 및 로그인 Rate Limiting
- 반복 로그인 실패 탐지
- 일정 횟수 이상 실패 시 클라이언트 임시 차단
- 인증 성공/실패/차단/Rate Limit 감사 로그 기록
- 보안 이벤트 실시간 대시보드
- Prepared Statement를 이용한 DB 쿼리
- 입력값 검증 및 요청 Body 크기 제한
- 원본 IP 대신 HMAC-SHA256 해시 저장

## 기술 스택

- Node.js
- Express.js
- SQLite (better-sqlite3)
- EJS
- bcryptjs
- JSON Web Token
- Helmet
- express-rate-limit
- HTML / CSS

## 프로젝트 구조

```text
Secure_Server_Guard/
├─ app.js
├─ server.js
├─ package.json
├─ .env.example
├─ .gitignore
├─ public/
├─ views/
├─ scripts/
├─ tests/
└─ src/
   ├─ db.js
   ├─ config.js
   ├─ middleware/
   ├─ routes/
   ├─ services/
   └─ utils/
```

## 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경변수 생성

`.env.example`을 복사하여 `.env` 파일을 생성하고 값을 변경합니다. 실제 `.env` 파일은 `.gitignore`에 포함되어 GitHub에 업로드되지 않습니다.

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=충분히_긴_랜덤_문자열
IP_HASH_SALT=별도의_긴_랜덤_문자열
ADMIN_USERNAME=admin
ADMIN_PASSWORD=안전한_비밀번호
```

### 3. 관리자 계정 생성

```bash
npm run seed
```

비밀번호는 평문으로 저장하지 않고 bcrypt 해시로 저장됩니다.

### 4. 서버 실행

```bash
npm start
```

브라우저에서 접속합니다.

```text
http://localhost:3000/login
```

## Brute-force 방어 시연

서버가 실행 중인 상태에서 별도 터미널에서 다음 명령을 실행할 수 있습니다.

```bash
npm run demo:failures
```

로컬 서버에 실패 로그인을 반복하여 탐지 및 임시 차단 동작을 확인하기 위한 **로컬 데모 스크립트**입니다.

기본 정책은 다음과 같습니다.

```text
10분 내 로그인 실패 5회
        ↓
15분간 임시 차단
        ↓
보안 이벤트 및 차단 내역 기록
```

## 보안 처리 흐름

```text
Client Request
      ↓
Helmet Security Headers
      ↓
IP Privacy Hashing
      ↓
Temporary Block Check
      ↓
Rate Limiting
      ↓
Input Validation
      ↓
Authentication
      ↓
Audit Logging
      ↓
Security Dashboard
```

## 테스트

```bash
npm test
```

- Health endpoint
- HTTP Security Headers
- 인증되지 않은 Dashboard 접근 차단

## 학습 내용

- 웹 서버 인증 구조
- 비밀번호 안전 저장 방식
- Brute-force 로그인 방어
- Rate Limiting
- HTTP 보안 헤더
- JWT / Cookie 인증
- 서버 감사 로그 설계
- 개인정보 최소화를 고려한 IP 해싱
- 서버 보안 이벤트 모니터링

## 참고사항

학습 및 포트폴리오 목적의 방어형 프로젝트입니다. 실제 상용 환경에서는 HTTPS, 외부 세션/로그 저장소, 중앙화된 모니터링, Secret Manager, WAF 등의 추가 구성이 필요합니다.

## Author

**PorlauMenart**
