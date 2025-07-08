import { useAlertBanner } from '../../../src/hooks/useAlertBanner';

export default function AlertBanner({ alerts }: any) {
  const hookAlerts = useAlertBanner();
  const allAlerts = alerts || hookAlerts;
  return (
    <div>
      {allAlerts.map((alert: any) => (
        <div key={alert.id} style={{ color: alert.type === 'error' ? 'red' : 'orange' }}>
          {alert.message}
        </div>
      ))}
    </div>
  );
} 