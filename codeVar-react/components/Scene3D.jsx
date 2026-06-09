import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ACTION_TYPES } from './actionGenerator';
import styles from '../styles/Scene3D.module.css';

/**
 * Rende un'azione 3D. La prop `t` (0..1) controlla l'avanzamento.
 * `camera` sceglie l'angolo. La posizione al momento chiave è
 * coerente con il verdetto calcolato nel generatore.
 */
export default function Scene3D({ action, t, camera = 'broadcast' }) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);

  // Setup una volta sola
  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth || 880;
    const H = 440;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d1f12');
    scene.fog = new THREE.Fog('#0d1f12', 70, 150);

    scene.add(new THREE.AmbientLight('#ffffff', 0.6));
    const sun = new THREE.DirectionalLight('#ffffff', 1.1);
    sun.position.set(20, 45, 25);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60 });
    scene.add(sun);

    const cams = {
      broadcast: mk([0, 24, 52]),
      offside:   mk([-50, 11, 8]),
      aerial:    mk([6, 64, 2]),
    };
    function mk(p) {
      const c = new THREE.PerspectiveCamera(50, W / H, 0.1, 500);
      c.position.set(...p); c.lookAt(0, 1, 0);
      return c;
    }

    // Campo
    const FIELD_L = 110, FIELD_W = 64;
    const pitch = new THREE.Mesh(
      new THREE.PlaneGeometry(FIELD_L, FIELD_W),
      new THREE.MeshStandardMaterial({ color: '#1f6b29' })
    );
    pitch.rotation.x = -Math.PI / 2;
    pitch.receiveShadow = true;
    scene.add(pitch);

    for (let i = 0; i < 11; i++) {
      if (i % 2 === 0) {
        const g = new THREE.Mesh(
          new THREE.PlaneGeometry(FIELD_L / 11, FIELD_W),
          new THREE.MeshStandardMaterial({ color: '#1b5f24' })
        );
        g.rotation.x = -Math.PI / 2;
        g.position.set(-FIELD_L / 2 + i * (FIELD_L / 11) + FIELD_L / 22, 0.01, 0);
        scene.add(g);
      }
    }

    const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5 });
    const addLine = (w, h, x, z) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lineMat);
      m.rotation.x = -Math.PI / 2; m.position.set(x, 0.02, z); scene.add(m);
    };
    addLine(0.4, FIELD_W, 0, 0);
    addLine(FIELD_L, 0.4, 0, FIELD_W / 2);
    addLine(FIELD_L, 0.4, 0, -FIELD_W / 2);
    addLine(0.4, 34, 38, 0); // area destra

    // Porta
    const goalMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });
    const post = (x, z) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 7, 8), goalMat);
      p.position.set(x, 3.5, z); scene.add(p);
    };
    post(52, -5); post(52, 5);
    const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 10, 8), goalMat);
    cross.rotation.x = Math.PI / 2; cross.position.set(52, 7, 0); scene.add(cross);

    // Stickman factory
    function stick(color) {
      const g = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color });
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), mat);
      head.position.y = 6.2; head.castShadow = true; g.add(head);
      const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.2, 8), mat);
      torso.position.y = 4; torso.castShadow = true; g.add(torso);
      const legL = limb(mat); legL.position.set(-0.45, 1.4, 0); g.add(legL);
      const legR = limb(mat); legR.position.set(0.45, 1.4, 0); g.add(legR);
      const armL = limb(mat, 2.2); armL.position.set(-0.95, 4.8, 0); g.add(armL);
      const armR = limb(mat, 2.2); armR.position.set(0.95, 4.8, 0); g.add(armR);
      g.userData = { legL, legR, armL, armR };
      return g;
    }
    function limb(mat, len = 2.8) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, len, 6), mat);
      m.castShadow = true; return m;
    }

    const attacker = stick('#e03050'); scene.add(attacker);
    const defenders = [stick('#2d6cf0'), stick('#2d6cf0'), stick('#2d6cf0')];
    defenders.forEach((d) => scene.add(d));
    const keeper = stick('#f5a623'); scene.add(keeper);

    const ball = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#ffffff' })
    );
    ball.castShadow = true; scene.add(ball);

    // Linea fuorigioco 3D
    const offLine = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, FIELD_W),
      new THREE.MeshBasicMaterial({ color: '#29b6f6', transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    );
    offLine.rotation.y = Math.PI / 2;
    offLine.position.y = 3;
    offLine.visible = false;
    scene.add(offLine);

    stateRef.current = { renderer, scene, cams, attacker, defenders, keeper, ball, offLine };

    return () => {
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, []);

  // Aggiorna ogni volta che cambiano action / t / camera
  useEffect(() => {
    const st = stateRef.current;
    if (!st || !action) return;
    const { renderer, scene, cams, attacker, defenders, keeper, ball, offLine } = st;

    const ease = (x) => (x < 0.5 ? 2 * x * x : -1 + (4 - 2 * x) * x);
    const run = (o, time, moving) => {
      const sw = moving ? Math.sin(time * 26) * 0.7 : 0;
      const u = o.userData;
      u.legL.rotation.x = sw; u.legR.rotation.x = -sw;
      u.armL.rotation.x = -sw; u.armR.rotation.x = sw;
    };

    offLine.visible = false;
    defenders.forEach((d) => (d.visible = false));
    keeper.visible = true;

    if (action.type === ACTION_TYPES.FUORIGIOCO) {
      const s = action.setup;
      defenders.forEach((d) => (d.visible = true));

      // ATTACCANTE: interpolazione tale che a t = keyT sia ESATTAMENTE in attackerKeyX
      let ax;
      if (t <= action.keyT) {
        ax = s.attStartX + (s.attackerKeyX - s.attStartX) * (t / action.keyT);
      } else {
        ax = s.attackerKeyX + (s.attEndX - s.attackerKeyX) * ((t - action.keyT) / (1 - action.keyT));
      }
      attacker.position.set(ax, 0, s.attZ);
      attacker.rotation.y = 0;
      run(attacker, t, true);

      // DIFENSORI sulla linea
      defenders.forEach((d, i) => {
        d.position.set(s.defLineX - i * 0.3, 0, s.defZ[i]);
        d.rotation.y = Math.PI;
        run(d, t + i * 0.1, true);
      });

      keeper.position.set(50, 0, s.attZ * 0.3);
      keeper.rotation.y = Math.PI;

      // PALLA: dal passatore all'attaccante, arriva esattamente a keyT
      const bt = Math.min(t / action.keyT, 1);
      ball.position.set(
        s.passerX + (s.attackerKeyX - 1 - s.passerX) * ease(bt),
        0.55 + Math.sin(bt * Math.PI) * 1.6,
        s.passerZ + (s.attZ - s.passerZ) * ease(bt)
      );

      // LINEA fuorigioco visibile dal passaggio in poi
      if (t >= action.keyT) {
        offLine.visible = true;
        offLine.position.x = s.defLineX;
        offLine.material.color.set(
          action.correct === 'Annulla Gol' ? '#ff3b3b' : '#29b6f6'
        );
      }
    }

    else if (action.type === ACTION_TYPES.RIGORE) {
      const s = action.setup;
      const def = defenders[0]; def.visible = true;
      const tc = Math.min(t / action.keyT, 1);
      const ax = s.attStartX + (s.contactX - s.attStartX) * ease(tc);
      const az = s.attStartZ + (s.contactZ - s.attStartZ) * ease(tc);
      const dx = s.defStartX + (s.contactX + 1.2 - s.defStartX) * ease(tc);
      const dz = s.defStartZ + (s.contactZ - s.defStartZ) * ease(tc);

      const fallen = t > action.keyT && s.hasContact;
      attacker.position.set(ax, 0, az);
      attacker.rotation.set(0, 0, fallen ? Math.PI / 2.3 : 0);
      run(attacker, t, !fallen);
      def.position.set(dx, 0, dz); def.rotation.y = Math.PI; run(def, t, true);
      keeper.position.set(s.keeperX, 0, s.keeperZ); keeper.rotation.y = Math.PI;
      ball.position.set(ax + 1.5, 0.55, az + 0.5);
    }

    else if (action.type === ACTION_TYPES.FALLO) {
      const s = action.setup;
      const def = defenders[0]; def.visible = true;
      const tc = Math.min(t / action.keyT, 1);
      const ax = s.attStartX + (s.midX - s.attStartX) * ease(tc);
      const az = s.attStartZ + (s.midZ - s.attStartZ) * ease(tc);
      const dx = s.defStartX + (s.midX + 1.2 - s.defStartX) * ease(tc);
      const dz = s.defStartZ + (s.midZ - s.defStartZ) * ease(tc);
      const fallen = t > action.keyT && s.fall;
      attacker.position.set(ax, 0, az);
      attacker.rotation.set(0, 0, fallen ? Math.PI / 2.3 : 0);
      run(attacker, t, !fallen);
      def.position.set(dx, 0, dz); def.rotation.y = Math.PI; run(def, t, true);
      keeper.visible = false;
      ball.position.set(ax + 1.4, 0.55, az + 0.4);
    }

    else if (action.type === ACTION_TYPES.GOL) {
      const s = action.setup;
      const bt = ease(t);
      ball.position.set(
        s.startX + (s.goalX - s.startX) * bt,
        0.55 + Math.sin(t * Math.PI) * 2,
        s.startZ + (s.goalZ - s.startZ) * bt
      );
      attacker.position.set(s.startX - 4 + 30 * t, 0, s.startZ);
      attacker.rotation.y = 0; run(attacker, t, true);
      keeper.position.set(50, 0, s.goalZ); keeper.rotation.y = Math.PI;
    }

    renderer.render(scene, cams[camera] || cams.broadcast);
  }, [action, t, camera]);

  return <div ref={mountRef} className={styles.scene} />;
}
