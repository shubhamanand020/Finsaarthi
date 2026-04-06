import React from 'react';
import { motion } from 'framer-motion';

const Skeleton = ({ width, height, borderRadius = '8px', className = '', style = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`skeleton-shimmer ${className}`}
      style={{
        width: width || '100%',
        height: height || '20px',
        backgroundColor: 'var(--border)',
        borderRadius,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export const ScholarshipSkeleton = () => (
  <div className="glass-card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ flex: 1 }}>
        <Skeleton width="80%" height="1.2rem" />
        <Skeleton width="40%" height="0.8rem" style={{ marginTop: '0.5rem' }} />
      </div>
      <Skeleton width="60px" height="24px" borderRadius="12px" />
    </div>
    <Skeleton width="100px" height="2rem" style={{ margin: '0.5rem 0' }} />
    <div style={{ flex: 1 }}>
      <Skeleton width="100%" height="0.8rem" />
      <Skeleton width="100%" height="0.8rem" style={{ marginTop: '0.4rem' }} />
      <Skeleton width="60%" height="0.8rem" style={{ marginTop: '0.4rem' }} />
    </div>
    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
      <Skeleton width="50%" height="2.5rem" borderRadius="20px" />
      <Skeleton width="50%" height="2.5rem" borderRadius="20px" />
    </div>
  </div>
);

export const DashboardStatSkeleton = () => (
  <div className="stat-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <Skeleton width="30px" height="30px" borderRadius="8px" />
    <Skeleton width="40%" height="0.8rem" style={{ marginTop: '0.5rem' }} />
    <Skeleton width="60%" height="1.8rem" style={{ marginTop: '0.25rem' }} />
  </div>
);

export default Skeleton;
