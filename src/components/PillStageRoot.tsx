import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePillStore } from '../store/usePillStore';
import { useHitTestPassthrough } from '../hooks/useHitTestPassthrough';
import { useTauriHardwareBridge } from '../hooks/useTauriHardwareBridge';
import { useAstraSpeechStream } from '../hooks/useAstraSpeechStream';
import { PILL_LIQUID_SPRING } from '../constants/motionSprings';
import { CollapsedCapsuleHud } from './CollapsedCapsuleHud';
import { ExpandedIslandShell } from './ExpandedIslandShell';
import { AstraInPillMorphView } from './AstraInPillMorphView';
import { LiquidMetaballCanvas } from './shaders/LiquidMetaballCanvas';

export const PillStageRoot: React.FC = () => {
  const isExpanded = usePillStore((s) => s.isExpanded);
  const setExpanded = usePillStore((s) => s.setExpanded);
  const astraVisible = usePillStore((s) => s.astraVisible);
  const setAstraVisible = usePillStore((s) => s.setAstraVisible);
  const astraMode = usePillStore((s) => s.preferences.astraMode);
  const astraAnswerMarkdown = usePillStore((s) => s.astraAnswerMarkdown);
  const activePopdownId = usePillStore((s) => s.activePopdownId);

  // Initialize hardware bridge & speech stream hooks
  useTauriHardwareBridge();
  const { submitManualQuery } = useAstraSpeechStream();

  // Bounding box hit-test passthrough hook on the interactive capsule
  const hitRef = useHitTestPassthrough<HTMLDivElement>(isExpanded || !!activePopdownId);

  // Determine stage dimensions based on mode
  let targetWidth = 210;
  let targetHeight = 36;
  let borderRadius = 9999;

  if (astraVisible) {
    if (astraMode === 'OrbOnly') {
      targetWidth = 410;
      targetHeight = 64;
      borderRadius = 32;
    } else {
      targetWidth = 488;
      targetHeight = astraAnswerMarkdown ? 246 : 152;
      borderRadius = 28;
    }
  } else if (isExpanded) {
    targetWidth = 680;
    targetHeight = 380;
    borderRadius = 28;
  }

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-start pt-2 pointer-events-none select-none overflow-hidden">
      {/* 
        Interactive Zone: ONLY this capsule intercepts cursor events.
        All surrounding pixels in the 720x520 window are transparent click-through!
      */}
      <div
        id="pill-interactive-zone"
        ref={hitRef}
        className="relative pointer-events-auto flex items-center justify-center"
      >
        {/* WebGL Liquid Metaball Surface Tension behind the capsule */}
        <LiquidMetaballCanvas
          width={targetWidth}
          height={targetHeight}
          pillCenter={[targetWidth / 2, targetHeight / 2]}
          pillHalfSize={[targetWidth / 2, targetHeight / 2]}
          pillRadius={borderRadius}
          smoothK={16}
        />

        {/* Morphing Capsule Container */}
        <motion.div
          animate={{
            width: targetWidth,
            height: targetHeight,
            borderRadius: borderRadius,
          }}
          transition={PILL_LIQUID_SPRING}
          className="relative overflow-hidden bg-black/95 shadow-2xl border border-white/10 backdrop-blur-2xl"
          style={{ willChange: 'width, height, border-radius' }}
        >
          <AnimatePresence mode="wait">
            {astraVisible ? (
              <motion.div
                key="astra-view"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <AstraInPillMorphView
                  onClose={() => setAstraVisible(false)}
                  onSubmitQuery={submitManualQuery}
                />
              </motion.div>
            ) : isExpanded ? (
              <motion.div
                key="expanded-shell"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <ExpandedIslandShell onCollapse={() => setExpanded(false)} />
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-hud"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full flex items-center justify-center"
              >
                <CollapsedCapsuleHud
                  onExpand={() => setExpanded(true)}
                  onSummonAstra={(e) => {
                    e.stopPropagation();
                    setAstraVisible(true);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};
