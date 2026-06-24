# Dior CRM Backend

CRM 및 백오피스 운영을 위한 NestJS 기반 백엔드 API입니다.  
고객, 컨설턴트, 제품, 추천, 디바이스, 통계, 로그인/권한 관리 기능을 도메인별 모듈로 분리해 제공합니다.

## Overview

- 관리자/운영용 API 제공
- 인증, 권한, 로깅, 예외 처리를 전역 공통 계층으로 분리
- 다중 PostgreSQL DB 연결
- TypeORM 기반 데이터 접근
- S3, SAML, JWT, 메일 발송 등 외부 연동 포함
- Swagger 및 e2e 테스트 구조 지원

## Tech Stack

- NestJS
- TypeScript
- TypeORM
- PostgreSQL
- Swagger
- JWT
- Passport / SAML
- Nodemailer
- AWS S3
- Redis / Schedule

## Architecture

이 서비스는 기능 중심 NestJS 모듈 구조로 구성되어 있습니다.

- `src/modules`: 도메인별 기능 모듈
- `src/common`: 공통 미들웨어, 가드, 필터, 유틸, repository, entity
- `src/config`: DB, 인증, 환경설정
- `src/jwt`: 인증 토큰 및 페이로드 관련 로직
- `src/public`: 메일 템플릿 및 정적 리소스

### Main Domains

- `auth`: 로그인, 토큰, 권한 처리
- `crm`: 고객/컨설턴트/제품 관리
- `dior`: 백오피스 전용 관리 API
- `consultants`: 컨설턴트 업무 영역
- `customers`: 고객 계정 및 조회
- `products`: 제품 관리
- `productLog`: 제품 로그 관리
- `dataReplication`: 데이터 동기화
- `partnerdb`: 파트너/브랜드 연동
- `apiHealthCheck`: 헬스체크

## Key Features

- 고객/컨설턴트/관리자 계정 관리
- 제품, 속성, 추천, 로그 관리
- 권한별 접근 제어
- SAML 기반 사내 로그인 흐름 지원
- 다중 DB와 레거시 데이터 소스 연동
- 공통 응답/에러 포맷 표준화
- 배포 환경에서 HTTPS + SNI 지원
- 운영 편의를 위한 Swagger, PM2, migration 제공

## Folder Structure

```text
src
├─ common
├─ config
├─ jwt
├─ modules
│  ├─ auth
│  ├─ crm
│  ├─ dior
│  ├─ consultants
│  ├─ customers
│  ├─ products
│  └─ ...
└─ main.ts
```

## Run Locally

```bash
npm install
npm run start:dev
```

## Environment Variables

`.env` 또는 `env/.env`에서 사용하는 대표 항목:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=*****
POSTGRES_DB=*****
EMAIL_HOST=*****
EMAIL_USER=*****
EMAIL_PASSWORD=*****
APP_ID=*****
JWT_CONFIRMATION_TIME=*****
JWT_RESET_PASSWORD_SECRET=*****
JWT_RESET_PASSWORD_TIME=*****
DOMAIN=*****
EXTERNAL_API_BASE_URL=*****
```

## Scripts

```bash
npm run start
npm run start:dev
npm run start:prod
npm run test
npm run test:e2e
npm run migration:run
```

## Portfolio Notes

- 대규모 레거시 데이터와 운영 API를 하나의 NestJS 애플리케이션으로 안정적으로 통합했습니다.
- 전역 미들웨어와 권한 가드로 인증/로깅/예외 정책을 일관되게 관리했습니다.
- 기능별 모듈 분리를 통해 백오피스 기능 확장에 대응할 수 있게 구성했습니다.
