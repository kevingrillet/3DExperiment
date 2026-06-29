import { Suspense, useLayoutEffect, useRef } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { Bounds, Center, Grid, Html, OrbitControls } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import type { BufferGeometry, Mesh } from 'three';
import { ErrorBoundary } from './ErrorBoundary';
import { useTheme } from '../app/theme';
import { useI18n } from '../i18n/I18nProvider';

interface StlViewerProps {
  url: string;
  autoRotate: boolean;
  wireframe: boolean;
}

/** Couleurs de la scène 3D selon le thème (le fond/grille sont peints en JS). */
const SCENE_COLORS = {
  light: { background: '#f1f5f9', section: '#94a3b8', cell: '#cbd5e1' },
  dark: { background: '#0b1120', section: '#475569', cell: '#243049' },
} as const;

function Model({ url, wireframe }: { url: string; wireframe: boolean }) {
  const geometry = useLoader(STLLoader, url) as BufferGeometry;
  const meshRef = useRef<Mesh>(null);

  useLayoutEffect(() => {
    geometry.computeVertexNormals();
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#9bb3e0" metalness={0.1} roughness={0.6} wireframe={wireframe} />
    </mesh>
  );
}

function LoaderOverlay() {
  const { t } = useI18n();
  return (
    <Html center>
      <div className="rounded bg-surface/80 px-3 py-1 text-sm text-muted">
        {t('viewer.loadingModel')}
      </div>
    </Html>
  );
}

export function StlViewer({ url, autoRotate, wireframe }: StlViewerProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const colors = SCENE_COLORS[theme];
  return (
    <ErrorBoundary
      fallback={
        <div className="flex h-full items-center justify-center text-faint">
          {t('viewer.loadError')}
        </div>
      }
    >
      <Canvas
        shadows
        camera={{ position: [80, 60, 80], fov: 45 }}
        className="!h-full !w-full rounded-lg"
        aria-label={t('viewer.canvasLabel')}
      >
        <color attach="background" args={[colors.background]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[50, 80, 40]} intensity={1.1} castShadow />
        <directionalLight position={[-40, -20, -30]} intensity={0.3} />
        <Suspense fallback={<LoaderOverlay />}>
          <Bounds fit clip observe margin={1.3}>
            <Center>
              <Model url={url} wireframe={wireframe} />
            </Center>
          </Bounds>
        </Suspense>
        <Grid
          infiniteGrid
          cellSize={5}
          sectionSize={25}
          fadeDistance={400}
          sectionColor={colors.section}
          cellColor={colors.cell}
          position={[0, -0.01, 0]}
        />
        <OrbitControls autoRotate={autoRotate} autoRotateSpeed={2} enablePan makeDefault />
      </Canvas>
    </ErrorBoundary>
  );
}
