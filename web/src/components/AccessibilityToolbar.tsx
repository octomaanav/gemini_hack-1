import React from 'react';

type Props = {
  onVoiceOverToggle: (enabled: boolean) => void;
  onBraille: () => void;
  onStoryModeToggle: (enabled: boolean) => void;
  onHighContrastToggle: (enabled: boolean) => void;
  onIncreaseText: () => void;
  onDecreaseText: () => void;
  voiceOverEnabled: boolean;
  storyModeEnabled: boolean;
  highContrastEnabled: boolean;
  isBrailleLoading?: boolean;
};

const AccessibilityToolbar: React.FC<Props> = ({
  onVoiceOverToggle,
  onBraille,
  onStoryModeToggle,
  onHighContrastToggle,
  onIncreaseText,
  onDecreaseText,
  voiceOverEnabled,
  storyModeEnabled,
  highContrastEnabled,
  isBrailleLoading
}) => {
  return (
    <div className="flex items-center gap-2" role="toolbar" aria-label="Accessibility toolbar">
      <button
        onClick={() => onVoiceOverToggle(!voiceOverEnabled)}
        className={`px-3 py-1 rounded-lg text-sm border ${voiceOverEnabled ? 'bg-blue-600 text-white' : 'bg-white'}`}
        aria-pressed={voiceOverEnabled}
        title={voiceOverEnabled ? "Stop VoiceOver" : "Start VoiceOver"}
      >
        {voiceOverEnabled ? '⏹️ Stop VoiceOver' : '🔊 Start VoiceOver'}
      </button>

      <button
        onClick={onBraille}
        disabled={isBrailleLoading}
        className={`px-3 py-1 rounded-lg text-sm border bg-white flex items-center gap-1 ${isBrailleLoading ? 'cursor-wait opacity-70' : ''}`}
        title="Convert to Braille"
      >
        {isBrailleLoading ? (
          <>
            <svg className="animate-spin h-3 w-3 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Doing...
          </>
        ) : (
          <>⠃ Braille</>
        )}
      </button>

      <button
        onClick={() => onStoryModeToggle(!storyModeEnabled)}
        className={`px-3 py-1 rounded-lg text-sm border ${storyModeEnabled ? 'bg-blue-600 text-white' : 'bg-white'}`}
        aria-pressed={storyModeEnabled}
        title="Toggle Story Mode"
      >
        📖 Story
      </button>

      <button
        onClick={() => onHighContrastToggle(!highContrastEnabled)}
        className={`px-3 py-1 rounded-lg text-sm border ${highContrastEnabled ? 'bg-blue-600 text-white' : 'bg-white'}`}
        aria-pressed={highContrastEnabled}
        title="Toggle High Contrast"
      >
        🌓 Contrast
      </button>

      <button
        onClick={onDecreaseText}
        className="px-2 py-1 rounded-lg text-sm border bg-white"
        title="Decrease text size"
        aria-label="Decrease text size"
      >
        A-
      </button>

      <button
        onClick={onIncreaseText}
        className="px-2 py-1 rounded-lg text-sm border bg-white"
        title="Increase text size"
        aria-label="Increase text size"
      >
        A+
      </button>
    </div>
  );
};

export default AccessibilityToolbar;
