
const availableSounds = [
    { id: 'sonar', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
    { id: 'chime', url: 'https://assets.mixkit.co/active_storage/sfx/2860/2860-preview.mp3' },
    { id: 'pulse', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
    { id: 'glass', url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' }
];

export const playNotificationSound = () => {
    const isSoundEnabled = localStorage.getItem('soundAlerts') !== 'false';
    const selectedSoundId = localStorage.getItem('notificationSound') || 'sonar';

    if (!isSoundEnabled) return;

    const sound = availableSounds.find(s => s.id === selectedSoundId);
    if (sound) {
        const audio = new Audio(sound.url);
        audio.play().catch(err => console.error('[SoundService] Playback blocked:', err));
    }
};
