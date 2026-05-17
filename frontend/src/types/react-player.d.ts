declare module 'react-player' {
  import { Component } from 'react';

  export interface ReactPlayerProps {
    url?: string | string[];
    playing?: boolean;
    controls?: boolean;
    light?: boolean | string;
    width?: string | number;
    height?: string | number;
    muted?: boolean;
    loop?: boolean;
    volume?: number;
    style?: React.CSSProperties;
    className?: string;
    onReady?: () => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
    onError?: () => void;
  }

  export default class ReactPlayer extends Component<ReactPlayerProps> {}
}