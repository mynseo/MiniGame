// 오락실에 걸리는 게임 목록. 새 게임을 만들면 <id>/index.html 에 넣고 여기 한 칸을 추가하세요.
// 최신 게임이 위에 오도록 added(추가한 날짜) 순으로 자동 정렬됩니다.
window.GAMES = [
  {
    id: 'elevator',
    title: '닫힘 버튼 연타',
    desc: '엘리베이터에 나 혼자. 저 멀리서 누가 뛰어온다. 오기 전에 닫힘 버튼을 연타해 문을 닫아라!',
    controls: ['터치', '마우스'],
    color: '#ffcc33',
    added: '2026-10-31',
    best: { key: 'elevator-close-best-fixed', unit: '초', decimals: 2, label: '고정 최고' }
  },
  {
    id: 'bus-3d',
    title: '급정거 버스 3D',
    desc: '손잡이를 놓쳤다! 급정거·급출발하는 버스에서 두 발로 버티기. 바닥엔 캔이 굴러다닌다.',
    controls: ['기울기', '터치', '키보드'],
    color: '#5cc46a',
    added: '2026-10-31',
    best: { key: 'bus-hold-best', unit: '정류장' }
  },
  {
    id: 'bus-2d',
    title: '급정거 버스',
    desc: '3D 버전의 원조. 옆에서 본 버스 안에서 급정거를 버틴다.',
    controls: ['기울기', '터치', '키보드'],
    color: '#2a5fc4',
    added: '2026-10-30',
    best: { key: 'bus-hold-best', unit: '정류장' }
  },
  {
    id: 'gull-mast',
    title: '갈매기 돛대',
    desc: '흔들리는 배 위, 끝없이 높은 돛대를 좌우 번갈아 탭해서 오른다. 어깨에 앉는 갈매기를 조심!',
    controls: ['터치', '키보드'],
    color: '#d8432e',
    added: '2026-10-30',
    best: { key: 'gull-mast-best', unit: 'm' }
  }
];
