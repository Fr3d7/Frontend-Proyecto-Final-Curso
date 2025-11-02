import React, { useState, useEffect } from 'react';

// Utilidades de fecha
const calculatePosition = (date, startDate, totalDays) => {
  const days = Math.ceil(
    Math.abs(new Date(date) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );
  return (days / totalDays) * 100;
};

const calculateWidth = (startDate, endDate, totalDays) => {
  const duration = Math.ceil(
    Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );
  return (duration / totalDays) * 100;
};

// Componente Gantt reutilizable
const GanttChartExample = ({ epicsList = [], storiesList = [], timeScale = 'months' }) => {
  // 1) Determinar rango de fechas
  const [units, setUnits] = useState([]);
  useEffect(() => {
    if (!epicsList.length && !storiesList.length) return;
    const dates = [
      ...epicsList.flatMap(e => [new Date(e.startDate), new Date(e.endDate)]),
      ...storiesList.flatMap(s => [new Date(s.startDate), new Date(s.endDate)])
    ];
    let minDate = new Date(Math.min(...dates));
    let maxDate = new Date(Math.max(...dates));
    // Ajustar márgenes
    if (timeScale === 'days') {
      minDate.setDate(minDate.getDate() - 7);
      maxDate.setDate(maxDate.getDate() + 7);
    } else if (timeScale === 'weeks') {
      minDate.setDate(minDate.getDate() - 14);
      maxDate.setDate(maxDate.getDate() + 14);
    } else if (timeScale === 'months') {
      minDate.setMonth(minDate.getMonth() - 1);
      maxDate.setMonth(maxDate.getMonth() + 1);
    } else if (timeScale === 'quarters') {
      minDate.setMonth(minDate.getMonth() - 3);
      maxDate.setMonth(maxDate.getMonth() + 3);
    }
    const temp = [];
    const cur = new Date(minDate);
    while (cur <= maxDate) {
      temp.push(new Date(cur));
      if (timeScale === 'days') cur.setDate(cur.getDate() + 1);
      else if (timeScale === 'weeks') cur.setDate(cur.getDate() + 7);
      else if (timeScale === 'months') cur.setMonth(cur.getMonth() + 1);
      else if (timeScale === 'quarters') cur.setMonth(cur.getMonth() + 3);
    }
    setUnits(temp);
  }, [epicsList, storiesList, timeScale]);

  if (!units.length) return null;
  const startDate = units[0];
  const endDate = units[units.length - 1];
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  const styles = {
    container: { overflowX: 'auto', padding: '1rem', background: '#fff', borderRadius: 8 },
    header: { display: 'flex', borderBottom: '1px solid #ddd' },
    unit: { flex: '0 0 100px', textAlign: 'center', padding: '0.5rem', fontSize: '0.8rem', borderRight: '1px solid #eee' },
    body: { position: 'relative', minWidth: units.length * 100 },
    todayLine: { position: 'absolute', top: 0, bottom: 0, left: `${calculatePosition(new Date(), startDate, totalDays)}%`, width: 2, background: 'red', zIndex: 5 },
    row: { position: 'relative', marginBottom: 16, height: 30 },
    barEpic: { position: 'absolute', height: '30px', background: '#4a90e2', borderRadius: 4, color: '#fff', paddingLeft: 8, display: 'flex', alignItems: 'center' },
    barStory: { position: 'absolute', height: '24px', background: '#63b3ed', borderRadius: 4, color: '#fff', paddingLeft: 8, top: 34, display: 'flex', alignItems: 'center' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        {units.map((u, i) => (
          <div key={i} style={styles.unit}>
            {timeScale === 'months'
              ? `${u.toLocaleString('default', { month: 'short' })} ${u.getFullYear()}`
              : u.toLocaleDateString()}
          </div>
        ))}
      </div>
      <div style={styles.body}>
        <div style={styles.todayLine} />
        {epicsList.map(epic => (
          <div key={epic.id} style={styles.row}>
            <div
              style={{
                ...styles.barEpic,
                left: `${calculatePosition(epic.startDate, startDate, totalDays)}%`,
                width: `${calculateWidth(epic.startDate, epic.endDate, totalDays)}%`
              }}
            >{epic.title}</div>
          </div>
        ))}
        {storiesList.map(story => (
          <div key={story.id} style={styles.row}>
            <div
              style={{
                ...styles.barStory,
                left: `${calculatePosition(story.startDate, startDate, totalDays)}%`,
                width: `${calculateWidth(story.startDate, story.endDate, totalDays)}%`
              }}
            >{story.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChartExample; 