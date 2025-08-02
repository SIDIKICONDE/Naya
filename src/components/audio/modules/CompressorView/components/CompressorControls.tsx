/**
 * Section des contrôles principaux du compresseur
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CompressorControl } from './CompressorControl';
import { formatRatio, formatAttack, formatRelease, formatDecibels, getValueColor } from '../utils';
import { PARAM_RANGES, getThemedControlColors } from '../constants';
import { useAudioTheme } from '../../../../../theme/hooks/useAudioTheme';
import { useTranslation } from '../../../../../i18n';
import type { CompressorState } from '../types';

interface CompressorControlsProps {
  state: CompressorState;
  onUpdateParameter: (param: keyof CompressorState, value: number) => void;
  compact?: boolean;
}

export const CompressorControls: React.FC<CompressorControlsProps> = ({
  state,
  onUpdateParameter,
  compact = false,
}) => {
  const audioTheme = useAudioTheme();
  const CONTROL_COLORS = getThemedControlColors(audioTheme.colors);
  const { t } = useTranslation();
  const { threshold, ratio, attack, release, knee, makeupGain } = state;

  // Couleurs dynamiques selon les valeurs
  const ratioColor = ratio >= 10 ? CONTROL_COLORS.ratioHigh : CONTROL_COLORS.ratio;
  const attackColor = attack < 5 ? CONTROL_COLORS.attackFast : CONTROL_COLORS.attack;
  const releaseColor = release > 500 ? CONTROL_COLORS.releaseSlow : CONTROL_COLORS.release;

  // Styles thématiques
  const styles = StyleSheet.create({
    mainControls: {
      backgroundColor: audioTheme.colors.knobBackground,
      borderRadius: 8,
      padding: audioTheme.spacing.md,
      marginBottom: audioTheme.spacing.md,
      borderWidth: 1,
      borderColor: audioTheme.colors.sliderTrack,
    },
    compactControls: {
      padding: audioTheme.spacing.sm,
      marginBottom: audioTheme.spacing.sm,
    },
    timeControls: {
      flexDirection: 'row',
      gap: audioTheme.spacing.md,
    },
    compactTimeControls: {
      flexDirection: 'row',
      gap: audioTheme.spacing.sm,
    },
    halfControl: {
      flex: 1,
    },
  });

  return (
    <View style={[styles.mainControls, compact && styles.compactControls]}>
      {/* Threshold */}
      <CompressorControl
        label={t('audio:modules.compressor.controls.threshold')}
        value={threshold}
        min={PARAM_RANGES.threshold.min}
        max={PARAM_RANGES.threshold.max}
        step={PARAM_RANGES.threshold.step}
        unit="dB"
        onChange={(value) => onUpdateParameter('threshold', value)}
        onComplete={(value) => onUpdateParameter('threshold', value)}
        color={CONTROL_COLORS.threshold}
        formatValue={(value) => formatDecibels(value)}
        compact={compact}
      />

      {/* Ratio */}
      <CompressorControl
        label={t('audio:modules.compressor.controls.ratio')}
        value={ratio}
        min={PARAM_RANGES.ratio.min}
        max={PARAM_RANGES.ratio.max}
        step={ratio < 10 ? 0.1 : 1}
        unit=""
        onChange={(value) => onUpdateParameter('ratio', value)}
        onComplete={(value) => onUpdateParameter('ratio', value)}
        color={ratioColor}
        formatValue={formatRatio}
        compact={compact}
      />

      {/* Attack & Release */}
      <View style={[styles.timeControls, compact && styles.compactTimeControls]}>
        <View style={styles.halfControl}>
          <CompressorControl
            label={t('audio:modules.compressor.controls.attack')}
            value={attack}
            min={PARAM_RANGES.attack.min}
            max={PARAM_RANGES.attack.max}
            step={attack < 10 ? 0.1 : 1}
            unit=""
            onChange={(value) => onUpdateParameter('attack', value)}
            onComplete={(value) => onUpdateParameter('attack', value)}
            color={attackColor}
            formatValue={formatAttack}
            compact={compact}
          />
        </View>

        <View style={styles.halfControl}>
          <CompressorControl
            label={t('audio:modules.compressor.controls.release')}
            value={release}
            min={PARAM_RANGES.release.min}
            max={PARAM_RANGES.release.max}
            step={release < 100 ? 5 : 25}
            unit=""
            onChange={(value) => onUpdateParameter('release', value)}
            onComplete={(value) => onUpdateParameter('release', value)}
            color={releaseColor}
            formatValue={formatRelease}
            compact={compact}
          />
        </View>
      </View>

      {/* Knee & Makeup Gain - Affichage conditionnel en mode compact */}
      {!compact && (
        <>
          {/* Knee */}
          <CompressorControl
            label={t('audio:modules.compressor.controls.knee')}
            value={knee}
            min={PARAM_RANGES.knee.min}
            max={PARAM_RANGES.knee.max}
            step={PARAM_RANGES.knee.step}
            unit="dB"
            onChange={(value) => onUpdateParameter('knee', value)}
            onComplete={(value) => onUpdateParameter('knee', value)}
            color={CONTROL_COLORS.knee}
            formatValue={(value) => formatDecibels(value)}
            compact={compact}
          />

          {/* Makeup Gain */}
          <CompressorControl
            label={t('audio:modules.compressor.controls.makeupGain')}
            value={makeupGain}
            min={PARAM_RANGES.makeupGain.min}
            max={PARAM_RANGES.makeupGain.max}
            step={PARAM_RANGES.makeupGain.step}
            unit="dB"
            onChange={(value) => onUpdateParameter('makeupGain', value)}
            onComplete={(value) => onUpdateParameter('makeupGain', value)}
            color={CONTROL_COLORS.makeupGain}
            formatValue={(value) => formatDecibels(value, true)}
            compact={compact}
          />
        </>
      )}

      {compact && (
        // En mode compact : Knee et Makeup Gain côte à côte
        <View style={styles.compactTimeControls}>
          <View style={styles.halfControl}>
            <CompressorControl
              label={t('audio:modules.compressor.controls.knee')}
              value={knee}
              min={PARAM_RANGES.knee.min}
              max={PARAM_RANGES.knee.max}
              step={PARAM_RANGES.knee.step}
              unit="dB"
              onChange={(value) => onUpdateParameter('knee', value)}
              onComplete={(value) => onUpdateParameter('knee', value)}
              color={CONTROL_COLORS.knee}
              formatValue={(value) => formatDecibels(value)}
              compact={compact}
            />
          </View>
          <View style={styles.halfControl}>
            <CompressorControl
              label={t('audio:modules.compressor.controls.gainCompact')}
              value={makeupGain}
              min={PARAM_RANGES.makeupGain.min}
              max={PARAM_RANGES.makeupGain.max}
              step={PARAM_RANGES.makeupGain.step}
              unit="dB"
              onChange={(value) => onUpdateParameter('makeupGain', value)}
              onComplete={(value) => onUpdateParameter('makeupGain', value)}
              color={CONTROL_COLORS.makeupGain}
              formatValue={(value) => formatDecibels(value, true)}
              compact={compact}
            />
          </View>
        </View>
      )}
    </View>
  );
};