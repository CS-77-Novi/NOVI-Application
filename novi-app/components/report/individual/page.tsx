'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import styles from './IndividualReport.module.css';

export default function IndividualReport() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className={styles.layout}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className={styles.mainContent}>
        
        {/* Overview Section */}
        {activeTab === 'Overview' && (
          <div>
            <h1 className={styles.header}>Overview Section</h1>
          </div>
        )}

        {/* Attention Score Section */}
        {activeTab === 'AttentionScore' && (
          <div className={styles.pinkBackgroundSection}>
            <h1 className={styles.header}>Attention Score</h1>
            
            <div className={styles.statsGrid}>
              <div className={styles.scoreCard}>
                <h3>Peak Attention</h3>
                <p>92%</p>
                <small>at 15:00</small>
              </div>
              <div className={styles.scoreCard}>
                <h3>Lowest Attention</h3>
                <p>65%</p>
                <small>at 25:00</small>
              </div>
              <div className={styles.scoreCard}>
                <h3>Average Score</h3>
                <p>84%</p>
                <small>Overall session</small>
              </div>
            </div>
          </div>
        )}

        {/* Distraction Events Section */}
        {activeTab === 'Distraction' && (
          <div className={styles.pinkBackgroundSection}>
            <h1 className={styles.header}>Distraction Events</h1>
            
            <div className={styles.statsGrid}>
              <div className={`${styles.card} ${styles.cardLookingAway}`}>Looking Away: 5 Events</div>
              <div className={`${styles.card} ${styles.cardHeadPoseDeviation}`}>Head Pose Deviation: 2 Events</div>
              <div className={`${styles.card} ${styles.cardEyeClosure}`}>Eye Closer: 2 Events</div>
              <div className={`${styles.card} ${styles.cardYawing}`}>Yawing: 2 Events</div>
            </div>

            {/* Event Timeline කොටස */}
            <div className={styles.timelineContainer}>
              <h2 className={styles.subHeader}>Event Timeline</h2>
              <div className={styles.timelineBox}>
                <div className={`${styles.timelineItem} ${styles.lookingAwayColor}`} >Looking Away - 0:35 </div>
                <div className={`${styles.timelineItem} ${styles.eyeCloserColor}`}>Eye Closer - 0:50</div>
                <div className={`${styles.timelineItem} ${styles.cardHeadPoseDeviation}`}>Head Pose Deviation - 1:10</div>
              </div>
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}