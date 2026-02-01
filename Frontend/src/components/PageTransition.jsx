import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/page-transition.css';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('enter');
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    // Only animate if path actually changed
    if (prevLocationRef.current !== location.pathname) {
      setTransitionStage('exit');
      
      const exitTimer = setTimeout(() => {
        setDisplayChildren(children);
        setTransitionStage('enter');
        prevLocationRef.current = location.pathname;
      }, 150); // Short exit duration

      return () => clearTimeout(exitTimer);
    } else {
      setDisplayChildren(children);
    }
  }, [children, location.pathname]);

  return (
    <div className={`page-transition ${transitionStage}`}>
      {displayChildren}
    </div>
  );
}
