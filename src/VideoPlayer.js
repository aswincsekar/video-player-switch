import React, { useRef, useEffect, useState } from 'react';

const VideoPlayer = () => {
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const video3Ref = useRef(null);
  const canvasRef = useRef(null);
  let currentVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  // Example durations in seconds for each video
  const video1Duration = 15; // Assume 2 minutes for video 1
  const video2Duration = 5;  // Assume 1.5 minutes for video 2
  const video3Duration = 15;  // Assume 1 minute for video 3
  const totalDuration = video1Duration + video2Duration + video3Duration;

  useEffect(() => {
    video1Ref.current.preload = 'auto';
    video2Ref.current.preload = 'auto';
    video3Ref.current.preload = 'auto';
  
    const context = canvasRef.current.getContext('2d');
    currentVideoRef.current = video1Ref.current;
  
    const playVideo = () => {
      if (!currentVideoRef.current.paused && !currentVideoRef.current.ended) {
        context.drawImage(currentVideoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        requestAnimationFrame(playVideo);
      }
    };
  
    const updateTime = () => {
      // Determine which video is currently playing and update the playback time accordingly
      let time = currentVideoRef.current.currentTime;
      if (currentVideoRef.current === video2Ref.current) {
        time += video1Duration;
      } else if (currentVideoRef.current === video3Ref.current) {
        time += video1Duration + video2Duration;
      }
      setCurrentPlaybackTime(time);
    };
  
    video1Ref.current.addEventListener('timeupdate', updateTime);
    video2Ref.current.addEventListener('timeupdate', updateTime);
    video3Ref.current.addEventListener('timeupdate', updateTime);
  
    video1Ref.current.onended = () => {
      setCurrentPlaybackTime(video1Duration);
      currentVideoRef.current = video2Ref.current;
      video2Ref.current.play().catch(error => console.log(error.message));
      playVideo();
    };
  
    video2Ref.current.onended = () => {
      setCurrentPlaybackTime(video1Duration + video2Duration);
      currentVideoRef.current = video3Ref.current;
      video3Ref.current.play().catch(error => console.log(error.message));
      playVideo();
    };
  
    video3Ref.current.onended = () => {
      setIsPlaying(false);
      setCurrentPlaybackTime(totalDuration);
    };
  
    if (isPlaying) {
      video1Ref.current.play().catch(error => console.log(error.message));
      playVideo();
    }
  
    // Cleanup function to remove the event listeners when the component unmounts or rerenders
    return () => {
      video1Ref.current.removeEventListener('timeupdate', updateTime);
      video2Ref.current.removeEventListener('timeupdate', updateTime);
      video3Ref.current.removeEventListener('timeupdate', updateTime);
    };
  
  }, [isPlaying]);
  

  const handlePlayPause = () => {
    if (isPlaying) {
      currentVideoRef.current.pause();
    } else {
      setIsPlaying(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSliderChange = (event) => {
    const newTime = Number(event.target.value);
    setCurrentPlaybackTime(newTime);

    // Calculate which video should be playing and seek to the correct time
    if (newTime <= video1Duration) {
      currentVideoRef.current = video1Ref.current;
      video1Ref.current.currentTime = newTime;
    } else if (newTime <= video1Duration + video2Duration) {
      currentVideoRef.current = video2Ref.current;
      video2Ref.current.currentTime = newTime - video1Duration;
    } else {
      currentVideoRef.current = video3Ref.current;
      video3Ref.current.currentTime = newTime - video1Duration - video2Duration;
    }

    if (!isPlaying) {
      currentVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <video ref={video1Ref} style={{ display: 'none' }}>
        <source src='http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' type="video/mp4" />
      </video>
      <video ref={video2Ref} style={{ display: 'none' }}>
        <source src='https://samplelib.com/lib/preview/mp4/sample-5s.mp4' type="video/mp4" />
      </video>
      <video ref={video3Ref} style={{ display: 'none' }}>
        <source src='http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4' type="video/mp4" />
      </video>
      <canvas ref={canvasRef} width="640" height="360"></canvas>
      <div>
        <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
        <input
          type="range"
          min="0"
          max={totalDuration}
          value={currentPlaybackTime}
          onChange={handleSliderChange}
          style={{ width: '100%', marginTop: '10px' }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer
