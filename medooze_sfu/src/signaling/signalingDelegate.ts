import { SignalingMessage } from '../data/signalingMessage';

export interface SignalingDelegate {
    onOffer: (message: SignalingMessage) => void
    onClose: () => void
}