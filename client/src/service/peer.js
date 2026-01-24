class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
          // Add TURN servers for better connectivity (optional but recommended)
          // Uncomment and add your TURN server credentials if needed
          // {
          //   urls: "turn:your-turn-server.com:3478",
          //   username: "username",
          //   credential: "passworrd"
          // }
        ],
      });
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }

  // Add ICE candidate handling
  addIceCandidate(candidate) {
    if (this.peer && candidate) {
      return this.peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  // Get connection state
  getConnectionState() {
    return this.peer?.connectionState || 'disconnected';
  }

  // Get ICE connection state
  getIceConnectionState() {
    return this.peer?.iceConnectionState || 'disconnected';
  }

  // Close and cleanup
  closePeer() {
    if (this.peer) {
      this.peer.close();
      this.peer = null;
    }
  }

  // Restart peer connection (useful for reconnection)
  restartPeer() {
    this.closePeer();
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    });
  }
}

export default new PeerService();