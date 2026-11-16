// 민서민서김 공용 3D 부품.
// 모든 게임의 사람·동물은 이 파일의 '멍한 떡' 캐릭터로 만든다.
// 규칙: 목 없이 몸에 얹힌 넓적한 떡 머리 + 멀리 떨어진 점 눈 + 늘 살짝 벌어진 입 + 머리카락 한 가닥,
//       콩 모양 통짜 몸, 철사처럼 가는 팔다리, 벙어리장갑 손, 큼직한 신발. 무광 재질, 부드러운 그림자.
// three.js(전역 THREE)를 먼저 불러온 뒤 <script src="../shared/minseo3d.js"> 로 쓴다.
(function () {
  const MS = {};

  /** 무광 재질. 같은 색·거칠기는 하나를 같이 쓴다 */
  const cache = {};
  MS.mat = (color, roughness = 0.8, metalness = 0) => {
    const k = color + ':' + roughness + ':' + metalness;
    return cache[k] || (cache[k] = new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  };

  /** 렌더러 기본값: 부드러운 그림자 + 영화 같은 톤 */
  MS.setupRenderer = (renderer) => {
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    return renderer;
  };

  function mesh(parent, geo, m, x = 0, y = 0, z = 0) {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true;
    parent.add(o); return o;
  }

  // 치수(m). 관절 위치는 바꾸지 않는다: 게임들이 손잡이 높이·앉는 높이를 여기에 맞춰 두었다
  const HEAD_R = 0.24, HEAD_S = [1.22, 0.86, 1]; // 옆으로 넓적한 떡 머리
  const ARM_R = 0.022, LEG_R = 0.027;            // 철사 팔다리
  const UPPER_ARM = 0.29, FOREARM = 0.27, THIGH = 0.43, SHIN = 0.42;
  const HIP_Y = THIGH + SHIN + 0.07; // 서 있을 때 골반 높이
  const BODY_R = 0.2;

  /** 미리 정해 둔 동네 사람들 색 조합. hairdo: 'sprout'(한 가닥, 기본) | 'two'(두 가닥) | 'bun'(쪽머리) | 'none' */
  MS.LOOKS = {
    me:      { skin: 0xffd9bf, shirt: 0xf2f2f2, pants: 0x34405e, shoes: 0xff8a5c, hair: 0x4a2c20, pack: 0xff8a5c },
    drummer: { skin: 0xffd9bf, shirt: 0x5b8def, pants: 0x34405e, shoes: 0xf2f2f2, hair: 0x4a2c20 },
    office:  { skin: 0xf1c3a0, shirt: 0x8fa37a, pants: 0x4a4036, shoes: 0x2b2b30, hair: 0x3a2a1e },
    student: { skin: 0xffd9bf, shirt: 0xe86f8e, pants: 0x2b3a67, shoes: 0xf2f2f2, hair: 0x15151b, hairdo: 'two' },
    granny:  { skin: 0xf6d2b8, shirt: 0xb07acb, pants: 0x5b5470, shoes: 0x6b4a3a, hair: 0xdedad6, hairdo: 'bun' },
    driver:  { skin: 0xf1c3a0, shirt: 0x6f8fd0, pants: 0x2b3a67, shoes: 0x2b2b30, hair: 0x2a1d14, cap: 0x2f4a8f },
    runner:  { skin: 0xf1c3a0, shirt: 0xffb13b, pants: 0x3b4a6b, shoes: 0xe23d5b, hair: 0x2a1d14 },
    cat:     { skin: 0xf6b26b, shirt: 0xffe08a, pants: 0x8a6bbf, shoes: 0xff8fa3, head: 'cat' }
  };

  /** 떡 머리 겉면 위의 점 (머리 중심 기준 x, y에서 앞쪽 z) */
  const onHead = (x, y) => HEAD_R * HEAD_S[2] * Math.sqrt(Math.max(0, 1 - (x / (HEAD_R * HEAD_S[0])) ** 2 - (y / (HEAD_R * HEAD_S[1])) ** 2));

  /**
   * 사람(또는 고양이) 한 명. root의 원점은 두 발 사이 바닥, 얼굴은 +Z 쪽.
   * opts: skin, shirt, pants, shoes, hair, hairdo, head('human'|'cat'), cap(모자 색), pack(가방 색), bulk(몸 굵기 배율), sit(true면 앉은 자세)
   */
  MS.person = (opts = {}) => {
    const o = Object.assign({}, MS.LOOKS.drummer, opts);
    const bulk = o.bulk || 1;
    const skin = MS.mat(o.skin, 0.7), shirt = MS.mat(o.shirt, 0.85), pants = MS.mat(o.pants, 0.85), shoes = MS.mat(o.shoes, 0.6);
    const root = new THREE.Group();
    const body = new THREE.Group(); root.add(body); // 기울기·통통 튀기는 여기에
    // 다리: 골반 관절 → 허벅지 → 무릎 → 정강이 → 큼직한 신발
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group(); hip.position.set(s * 0.09, HIP_Y, 0); body.add(hip);
      mesh(hip, new THREE.CapsuleGeometry(LEG_R, THIGH, 4, 10), pants, 0, -THIGH / 2, 0);
      const knee = new THREE.Group(); knee.position.y = -THIGH; hip.add(knee);
      mesh(knee, new THREE.CapsuleGeometry(LEG_R, SHIN, 4, 10), pants, 0, -SHIN / 2, 0);
      const foot = new THREE.Group(); foot.position.y = -SHIN - 0.03; knee.add(foot);
      const shoe = mesh(foot, new THREE.SphereGeometry(0.075, 16, 12), shoes, 0, 0.005, 0.045);
      shoe.scale.set(0.95, 0.62, 1.45);
      return { hip, knee };
    });
    // 몸: 윗옷 색 콩 하나, 아래쪽만 바지 색
    const upper = new THREE.Group(); upper.position.y = HIP_Y + 0.06; body.add(upper);
    const torso = mesh(upper, new THREE.CapsuleGeometry(BODY_R * bulk, 0.3, 8, 24), shirt, 0, 0.17, 0);
    torso.scale.z = 0.85;
    const shorts = mesh(upper, new THREE.SphereGeometry(BODY_R * bulk * 1.02, 24, 10, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5), pants, 0, 0.02, 0);
    shorts.scale.z = 0.85;
    if (o.pack) { const p = mesh(upper, new THREE.CapsuleGeometry(0.11, 0.14, 6, 14), MS.mat(o.pack, 0.75), 0, 0.27, -0.2); p.scale.set(1.15, 1, 0.7); }
    // 머리: 목 없이 몸 위에 얹힌 떡. head 그룹의 원점은 고개가 도는 축
    const head = new THREE.Group(); head.position.set(0, 0.54, -0.01); upper.add(head);
    const HY = 0.16, K = HEAD_R / 0.19; // 머리 중심 높이, 얼굴 부품 배율
    const skull = mesh(head, new THREE.SphereGeometry(HEAD_R, 32, 24), skin, 0, HY, 0);
    skull.scale.set(...HEAD_S);
    // 눈: 멀리 떨어진 똑같은 점 두 개
    const eyeMat = MS.mat(0x1d1a26, 0.4);
    const eyes = [[-0.115, -0.015, 0.019], [0.115, -0.015, 0.019]].map((v) => {
      const [x, y, r] = v.map((n) => n * K);
      const e = mesh(head, new THREE.SphereGeometry(r, 12, 10), eyeMat, x, HY + y, onHead(x, y) - r * 0.3);
      e.castShadow = false; return e;
    });
    // 입: 늘 조금 벌어져 있고, 놀라면 커진다
    const mouth = mesh(head, new THREE.SphereGeometry(0.017 * K, 12, 10), MS.mat(0x5a2030, 0.6), 0.012, HY - 0.07 * K, onHead(0.012, -0.07 * K) - 0.004);
    mouth.scale.set(1.25, 0.8, 0.4); mouth.castShadow = false;
    const top = HY + HEAD_R * HEAD_S[1];
    if (o.head === 'cat') {
      for (const s of [-1, 1]) { const e = mesh(head, new THREE.ConeGeometry(0.07, 0.12, 12), skin, s * 0.17, top - 0.012, 0); e.rotation.z = -s * 0.45; }
      for (const s of [-1, 1]) for (const k of [-1, 1]) { // 수염
        const w = mesh(head, new THREE.CylinderGeometry(0.003, 0.003, 0.11, 5), eyeMat, s * 0.225, HY - 0.075 + k * 0.016, 0.145);
        w.rotation.set(0, 0, Math.PI / 2 + s * k * 0.18); w.castShadow = false;
      }
    } else if (!o.cap) {
      const hairM = MS.mat(o.hair, 0.85);
      const strand = (x, tilt, len = 0.1) => {
        const g = new THREE.Group(); g.position.set(x, top - 0.012, 0); g.rotation.z = tilt; head.add(g);
        mesh(g, new THREE.CapsuleGeometry(0.013, len, 4, 8), hairM, 0, len / 2, 0);
        const tip = new THREE.Group(); tip.position.y = len; tip.rotation.z = tilt * 1.6; g.add(tip); // 끝이 한 번 꺾인다
        mesh(tip, new THREE.CapsuleGeometry(0.013, len * 0.5, 4, 8), hairM, 0, len * 0.25, 0);
      };
      const hairdo = o.hairdo || 'sprout';
      if (hairdo === 'sprout') strand(0.015, -0.5);
      else if (hairdo === 'two') { strand(-0.04, 0.55, 0.08); strand(0.045, -0.5, 0.08); }
      else if (hairdo === 'bun') mesh(head, new THREE.SphereGeometry(0.075, 16, 12), hairM, 0, top + 0.035, -0.04);
    }
    if (o.cap) {
      const c = MS.mat(o.cap, 0.7);
      const dome = mesh(head, new THREE.SphereGeometry(HEAD_R * 1.04, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.4), c, 0, HY + 0.01, 0);
      dome.scale.set(...HEAD_S);
      const brim = mesh(head, new THREE.CylinderGeometry(0.15, 0.15, 0.016, 20, 1, false, -Math.PI / 2, Math.PI), c, 0, HY + 0.078, 0.18);
      brim.scale.set(1.2, 1, 0.8);
    }
    // 팔: 어깨 관절 → 위팔 → 팔꿈치 → 아래팔 → 벙어리장갑 손
    const arms = {};
    for (const [k, s] of [['L', -1], ['R', 1]]) {
      const sh = new THREE.Group(); sh.position.set(s * 0.155 * bulk, 0.46, -0.02); upper.add(sh);
      mesh(sh, new THREE.CapsuleGeometry(ARM_R, UPPER_ARM, 4, 10), skin, 0, -UPPER_ARM / 2, 0);
      const el = new THREE.Group(); el.position.y = -UPPER_ARM; sh.add(el);
      mesh(el, new THREE.CapsuleGeometry(ARM_R, FOREARM, 4, 10), skin, 0, -FOREARM / 2, 0);
      const hand = mesh(el, new THREE.SphereGeometry(0.05, 14, 10), skin, 0, -FOREARM, 0);
      arms[k] = { sh, el, hand, s };
    }
    const P = {
      root, body, upper, head, eyes, mouth, arms, legs,
      /** 팔 자세. raise: 앞으로 드는 각(0 = 내림, π = 위로), out: 옆으로 벌림, bend: 팔꿈치 굽힘 */
      arm(side, raise = 0, out = 0.08, bend = 0.15) {
        const a = arms[side];
        a.sh.rotation.set(-raise, 0, a.s * out);
        a.el.rotation.set(-bend, 0, 0);
      },
      /** 다리 자세. swing: 앞으로 드는 각, bend: 무릎 굽힘 */
      leg(i, swing = 0, bend = 0) { legs[i].hip.rotation.x = -swing; legs[i].knee.rotation.x = bend; },
      /** 걷기·뛰기 한 프레임. phase는 계속 커지는 값, amp 0~1. 팔은 굽히지 않고 덜렁덜렁 흔든다 */
      run(phase, amp = 1) {
        const s = Math.sin(phase);
        P.leg(0, s * 0.8 * amp, Math.max(0, -s) * 1.1 * amp + 0.15 * amp);
        P.leg(1, -s * 0.8 * amp, Math.max(0, s) * 1.1 * amp + 0.15 * amp);
        P.arm('L', -s * 1.1 * amp, 0.12 + 0.3 * amp, 0.25 * amp);
        P.arm('R', s * 1.1 * amp, 0.12 + 0.3 * amp, 0.25 * amp);
        body.position.y = Math.abs(Math.cos(phase)) * 0.06 * amp;
        upper.rotation.x = 0.12 * amp;
        head.rotation.z = Math.sin(phase) * 0.12 * amp; // 머리가 좌우로 까딱까딱
      },
      _wide: 1,
      /** 놀람: 입이 크게 벌어지고 눈이 커진다 */
      panic(on) {
        P._wide = on ? 1.45 : 1;
        mouth.scale.set(on ? 2.3 : 1.25, on ? 2.6 : 0.8, 0.4);
        for (const e of eyes) e.scale.setScalar(P._wide);
      },
      _blink: 1 + Math.random() * 3,
      /** 매 프레임 호출: 3~5초마다 눈 깜빡임 */
      update(t) {
        if (t > P._blink + 0.14) P._blink = t + 2.5 + Math.random() * 2.5;
        const closed = t > P._blink;
        for (const e of eyes) e.scale.y = closed ? 0.12 : P._wide;
      }
    };
    P.arm('L'); P.arm('R');
    if (o.sit) { // 의자에 앉기: 좌판 높이 0.45m
      P.leg(0, Math.PI / 2, Math.PI / 2); P.leg(1, Math.PI / 2, Math.PI / 2);
      body.position.y = 0.47 - HIP_Y + 0.02;
      P.arm('L', 0.5, 0.05, 0.7); P.arm('R', 0.5, 0.05, 0.7);
    }
    return P;
  };

  /** 굴러다니는 캔 (눕힌 채 +Z 축으로 굴러감) */
  MS.can = (color = 0xe8604c) => {
    const g = new THREE.Group();
    const body = mesh(g, new THREE.CylinderGeometry(0.033, 0.033, 0.12, 20), MS.mat(color, 0.35, 0.3));
    body.rotation.x = Math.PI / 2;
    for (const s of [-1, 1]) { const lid = mesh(g, new THREE.CylinderGeometry(0.03, 0.033, 0.008, 20), MS.mat(0xd9dde3, 0.3, 0.8), 0, 0, s * 0.062); lid.rotation.x = Math.PI / 2; }
    return g;
  };

  window.MS3D = MS;
})();
