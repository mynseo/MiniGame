// 민서민서김 공용 3D 부품.
// 모든 게임의 사람·동물은 이 파일의 기본 도형 캐릭터로 만든다 (DrumSimulator의 드러머와 같은 생김새).
// 규칙: 큰 공 머리 + 바가지 머리카락 + 점 눈(입·코 없음), 캡슐 몸통과 팔다리, 무광 재질, 부드러운 그림자.
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

  // 치수(m). DrumSimulator 드러머와 같은 비율: 2등신에 가까운 큰 머리
  const HEAD_R = 0.155, ARM_R = 0.046, LEG_R = 0.07;
  const UPPER_ARM = 0.29, FOREARM = 0.27, THIGH = 0.43, SHIN = 0.42;
  const HIP_Y = THIGH + SHIN + 0.07; // 서 있을 때 골반 높이

  /** 미리 정해 둔 동네 사람들 색 조합 */
  MS.LOOKS = {
    me:      { skin: 0xffd9bf, shirt: 0xf2f2f2, pants: 0x34405e, shoes: 0xff8a5c, hair: 0x4a2c20, pack: 0xff8a5c },
    drummer: { skin: 0xffd9bf, shirt: 0x5b8def, pants: 0x34405e, shoes: 0xf2f2f2, hair: 0x4a2c20 },
    office:  { skin: 0xf1c3a0, shirt: 0x8fa37a, pants: 0x4a4036, shoes: 0x2b2b30, hair: 0x3a2a1e },
    student: { skin: 0xffd9bf, shirt: 0xe86f8e, pants: 0x2b3a67, shoes: 0xf2f2f2, hair: 0x15151b },
    granny:  { skin: 0xf6d2b8, shirt: 0xb07acb, pants: 0x5b5470, shoes: 0x6b4a3a, hair: 0xdedad6 },
    driver:  { skin: 0xf1c3a0, shirt: 0x6f8fd0, pants: 0x2b3a67, shoes: 0x2b2b30, hair: 0x2a1d14, cap: 0x2f4a8f },
    runner:  { skin: 0xf1c3a0, shirt: 0xffb13b, pants: 0x3b4a6b, shoes: 0xe23d5b, hair: 0x2a1d14 },
    cat:     { skin: 0xf6b26b, shirt: 0xffe08a, pants: 0x8a6bbf, shoes: 0xff8fa3, head: 'cat' }
  };

  /**
   * 사람(또는 고양이) 한 명. root의 원점은 두 발 사이 바닥, 얼굴은 +Z 쪽.
   * opts: skin, shirt, pants, shoes, hair, head('human'|'cat'), cap(모자 색), pack(가방 색), bulk(굵기 배율), sit(true면 앉은 자세)
   */
  MS.person = (opts = {}) => {
    const o = Object.assign({}, MS.LOOKS.drummer, opts);
    const bulk = o.bulk || 1;
    const skin = MS.mat(o.skin, 0.65), shirt = MS.mat(o.shirt, 0.8), pants = MS.mat(o.pants, 0.85), shoes = MS.mat(o.shoes, 0.6);
    const root = new THREE.Group();
    const body = new THREE.Group(); root.add(body); // 기울기·통통 튀기는 여기에
    // 골반
    const hips = mesh(body, new THREE.CapsuleGeometry(0.1, 0.13, 6, 14), pants, 0, HIP_Y + 0.02, 0);
    hips.rotation.z = Math.PI / 2; hips.scale.set(1, 1, 1.15);
    // 다리: 골반 관절 → 허벅지 → 무릎 → 정강이 → 신발
    const legs = [-1, 1].map((s) => {
      const hip = new THREE.Group(); hip.position.set(s * 0.09, HIP_Y, 0); body.add(hip);
      mesh(hip, new THREE.CapsuleGeometry(LEG_R * bulk, THIGH - LEG_R, 6, 12), pants, 0, -THIGH / 2, 0);
      const knee = new THREE.Group(); knee.position.y = -THIGH; hip.add(knee);
      mesh(knee, new THREE.CapsuleGeometry(LEG_R * 0.85 * bulk, SHIN - LEG_R, 6, 12), pants, 0, -SHIN / 2, 0);
      const foot = new THREE.Group(); foot.position.y = -SHIN - 0.03; knee.add(foot);
      const shoe = mesh(foot, new THREE.CapsuleGeometry(0.05, 0.17, 4, 12), shoes, 0, -0.005, 0.05);
      shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.05, 1, 0.75);
      return { hip, knee };
    });
    // 상체
    const upper = new THREE.Group(); upper.position.y = HIP_Y + 0.06; body.add(upper);
    const torso = mesh(upper, new THREE.CapsuleGeometry(0.15 * bulk, 0.18, 8, 20), shirt, 0, 0.25, 0);
    torso.scale.z = 0.8;
    if (o.pack) { const p = mesh(upper, new THREE.CapsuleGeometry(0.11, 0.14, 6, 14), MS.mat(o.pack, 0.75), 0, 0.27, -0.17); p.scale.set(1.15, 1, 0.7); }
    // 목과 머리
    mesh(upper, new THREE.CylinderGeometry(0.05, 0.06, 0.14, 12), skin, 0, 0.49, -0.01);
    const head = new THREE.Group(); head.position.set(0, 0.54, -0.01); upper.add(head);
    mesh(head, new THREE.SphereGeometry(HEAD_R, 32, 24), skin, 0, 0.13, 0);
    const eyeMat = MS.mat(0x1d1a26, 0.4);
    const eyes = [-1, 1].map((s) => {
      const x = s * 0.05, y = 0.135, r = HEAD_R * 0.97;
      return mesh(head, new THREE.SphereGeometry(0.02, 12, 10), eyeMat, x, y + 0.01, Math.sqrt(r * r - x * x - 0.0001));
    });
    const mouth = mesh(head, new THREE.SphereGeometry(0.028, 14, 10), MS.mat(0x5a2030, 0.6), 0, 0.08, HEAD_R * 0.93);
    mouth.scale.set(1, 1.2, 0.5); mouth.visible = false; // 놀랐을 때만 보인다
    if (o.head === 'cat') {
      for (const s of [-1, 1]) { const e = mesh(head, new THREE.ConeGeometry(0.07, 0.12, 12), skin, s * 0.09, 0.28, -0.01); e.rotation.z = -s * 0.35; }
    } else {
      const hair = mesh(head, new THREE.SphereGeometry(HEAD_R * 1.06, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), MS.mat(o.hair, 0.85), 0, 0.145, -0.012);
      hair.rotation.x = -0.32;
    }
    if (o.cap) {
      const c = MS.mat(o.cap, 0.7);
      mesh(head, new THREE.SphereGeometry(HEAD_R * 1.09, 28, 12, 0, Math.PI * 2, 0, Math.PI * 0.42), c, 0, 0.16, 0);
      const brim = mesh(head, new THREE.CylinderGeometry(0.1, 0.1, 0.015, 20, 1, false, -Math.PI / 2, Math.PI), c, 0, 0.2, 0.1);
      brim.scale.set(1, 1, 0.9);
    }
    // 팔: 어깨 관절 → 위팔 → 팔꿈치 → 아래팔 → 손
    const arms = {};
    for (const [k, s] of [['L', -1], ['R', 1]]) {
      const sh = new THREE.Group(); sh.position.set(s * 0.19, 0.46, -0.02); upper.add(sh);
      mesh(sh, new THREE.CapsuleGeometry(ARM_R * bulk, UPPER_ARM - ARM_R, 6, 12), shirt, 0, -UPPER_ARM / 2, 0);
      const el = new THREE.Group(); el.position.y = -UPPER_ARM; sh.add(el);
      mesh(el, new THREE.CapsuleGeometry(ARM_R * 0.9 * bulk, FOREARM - ARM_R, 6, 12), skin, 0, -FOREARM / 2, 0);
      const hand = mesh(el, new THREE.SphereGeometry(0.052, 14, 10), skin, 0, -FOREARM, 0);
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
      /** 걷기·뛰기 한 프레임. phase는 계속 커지는 값, amp 0~1 */
      run(phase, amp = 1) {
        const s = Math.sin(phase);
        P.leg(0, s * 0.8 * amp, Math.max(0, -s) * 1.1 * amp + 0.15 * amp);
        P.leg(1, -s * 0.8 * amp, Math.max(0, s) * 1.1 * amp + 0.15 * amp);
        P.arm('L', -s * 0.9 * amp, 0.12, 1.2 * amp);
        P.arm('R', s * 0.9 * amp, 0.12, 1.2 * amp);
        body.position.y = Math.abs(Math.cos(phase)) * 0.06 * amp;
        upper.rotation.x = 0.12 * amp;
      },
      /** 놀람: 입이 동그랗게 열리고 눈이 커진다 */
      panic(on) { mouth.visible = on; for (const e of eyes) e.scale.setScalar(on ? 1.35 : 1); },
      _blink: 1 + Math.random() * 3,
      /** 매 프레임 호출: 3~5초마다 눈 깜빡임 */
      update(t) {
        if (t > P._blink + 0.14) P._blink = t + 2.5 + Math.random() * 2.5;
        const closed = t > P._blink;
        for (const e of eyes) e.scale.y = closed ? 0.12 : e.scale.x;
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
