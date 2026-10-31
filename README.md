# MiniGame

브라우저에서 바로 하는 미니 게임 모음입니다. 설치·빌드 없이 HTML 파일 하나씩으로 돌아갑니다.

**바로 하기: https://mynseo.github.io/MiniGame/**

## 게임

### 🛗 닫힘 버튼 연타 — [`elevator/`](elevator/)

엘리베이터에 나 혼자. 저 멀리서 누가 뛰어옵니다. 오기 전에 닫힘 버튼을 연타해 문을 닫으세요.

- **1. 고정 버튼**: 버튼은 제자리. 30번을 6초 안에 최대한 빠르게.
- **2. 랜덤 버튼**: 누를 때마다 닫힘 버튼이 다른 곳으로 이동. 같이 움직이는 열림 버튼을 잘못 누르면 문이 다시 열립니다.

모드별 최고 기록은 브라우저에 저장됩니다.

## 로컬에서 하기

파일을 브라우저로 바로 열거나, 폴더에서 정적 서버를 띄우면 됩니다.

```bash
python3 -m http.server 8000   # http://localhost:8000
```

`main` 브랜치에 push하면 GitHub Actions가 GitHub Pages로 배포합니다.
(처음 한 번은 저장소 Settings → Pages → Source를 **GitHub Actions**로 바꿔 주세요.)
